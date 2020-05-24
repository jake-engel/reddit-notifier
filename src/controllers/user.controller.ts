import { Request, Response } from 'express';
import { UpdateUserInput } from '../dtos/update-user.dto';
import { CreateUserInput } from '../dtos/create-user.dto';
import { validate } from 'class-validator';
import { Repository, Connection } from 'typeorm';
import { User } from '../entities/user.entity';
import { Subreddit } from '../entities/subreddit.entity';
import { RedditService } from '../services/reddit.service';
import { MessagingService } from '../services/messaging.service';
import { Service, Inject } from 'typedi';
import { InjectRepository, InjectConnection } from 'typeorm-typedi-extensions';

// Eventually abstract all express related stuff out of controller and into a base
// class. This base class will inject any required parameters, headers, and the body
// and will pass it along to the controller. Then, the controller could just return
// any necessary data it wants to send back, and the base class could parse out this
// data and format into the express response to send back to the client.
@Service()
export class UserController {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>;
  @InjectConnection()
  private readonly connection: Connection;
  @Inject()
  private readonly redditService: RedditService;
  @Inject()
  private readonly messagingService: MessagingService;

  public async sendEmail(req: Request, res: Response): Promise<boolean | void> {
    try {
      const { id } = req.params;
      const user = await this.userRepo.findOne(id, {
        relations: ['subreddits'],
      });

      if (!user) {
        res.status(404).send({ error: `User id ${id} not found` });
        return;
      }

      // Confirm that user is subscribed
      if (!user.isSubscribed) {
        res.status(400).send({ error: `User id ${id}` });
        return;
      }

      const topPosts = (
        await Promise.all(
          user.subreddits.map(
            async ({ name }) => await this.redditService.getTopPosts(name),
          ),
        )
      ).filter(({ data }) => !!data.length);

      const emailResponse = await this.messagingService.sendEmail(
        user,
        topPosts,
      );

      res.status(200).send(emailResponse);
    } catch (err) {
      console.log(`err => `, err);
      res.status(err.status || 400).send({ error: err.message });
    }
  }

  public async list(req: Request, res: Response): Promise<User[] | void> {
    try {
      const users = await this.userRepo.find({
        relations: ['subreddits'],
      });

      res.status(200).send(users);
      return users;
    } catch (err) {
      console.log(`err => `, err);
      res.status(err.status || 400).send({ error: err.message });
    }
  }

  public async retrieve(req: Request, res: Response): Promise<User | void> {
    const { id } = req.params;

    let user;
    try {
      user = await this.userRepo.findOne(id, {
        relations: ['subreddits'],
      });

      if (!user) {
        res.status(404).send({ error: `User id ${id} not found` });
        return;
      }

      res.status(200).send(user);
      return user;
    } catch (err) {
      console.log(`err => `, err);
      res.status(err.status || 400).send({ error: err.message });
    }
  }

  // TODO: Abstract out repetitive code between the create and updated methods
  // Note, will just ignore all parameters unrelated to the user that are included with request
  public async create(req: Request, res: Response): Promise<User | void> {
    const createUserInput = new CreateUserInput(req.body);

    // Validate args
    const errors = await validate(createUserInput);
    if (!!errors?.length) {
      res.status(400).send({ error: errors });
      return;
    }

    try {
      // Confirm that a previous user with this email doesn't already exist
      const prevUser = await this.userRepo.findOne({
        emailAddress: createUserInput.emailAddress,
      });
      if (!!prevUser)
        throw new Error(
          `A user with email address ${createUserInput.emailAddress} already exists in the database`,
        );

      // Separate favorite subreddit relation so can add non-relational attributes properly
      const { favoriteSubreddits, ...userAttributes } = createUserInput;
      const userToAdd: Partial<User> = userAttributes;

      // Save user
      const addedUser = await this.userRepo.save(userToAdd);

      // Add subreddits relation
      if (!!favoriteSubreddits) {
        const subreddits = favoriteSubreddits.map(
          name => new Subreddit({ name, user: addedUser }),
        );
        await this.connection
          .createQueryBuilder()
          .insert()
          .into(Subreddit)
          .values(subreddits)
          .execute();
      }

      // Retrieve added user (optionally, could just construct from arguments)
      const newUserWithRelations = await this.userRepo.findOne(addedUser.id, {
        relations: ['subreddits'],
      });

      res.status(200).send(newUserWithRelations);
    } catch (err) {
      console.log(`err => `, err);
      res.status(err.status || 400).send({ error: err.message });
    }
  }

  // Note, will just ignore all parameters unrelated to the user that are included with request
  public async update(req: Request, res: Response): Promise<User | void> {
    const updateUserInput = new UpdateUserInput(req.body);

    // Validate args
    const errors = await validate(updateUserInput);
    if (!!errors?.length) {
      res.status(400).send({ error: errors });
      return;
    }

    try {
      // Confirm that the user already exists
      const user = await this.userRepo.findOne(req.params.id, {
        relations: ['subreddits'],
      });

      if (!user) {
        res.status(404).send({ error: `User id ${req.params.id} not found` });
        return;
      }

      // Separate favorite subreddit relation so can add non-relational attributes properly
      const { favoriteSubreddits, ...userAttributes } = updateUserInput;
      const userToUpdate: Partial<User> = userAttributes;

      // Update user
      await this.userRepo.save({ id: user.id, ...userToUpdate });

      // Add subreddits relation
      if (!!favoriteSubreddits) {
        // Remove previous subreddit relations
        if (!!user?.subreddits?.length)
          await this.connection
            .createQueryBuilder()
            .relation(User, 'subreddits')
            .of(user.id)
            .remove(user.subreddits.map(({ id }) => id));

        // Create and add new subreddit relations
        const subreddits = favoriteSubreddits.map(
          name => new Subreddit({ name, user }),
        );
        if (!!subreddits?.length)
          await this.connection
            .createQueryBuilder()
            .insert()
            .into(Subreddit)
            .values(subreddits)
            .execute();
      }

      // Retrieve updated user (optionally, could just construct from arguments)
      const newUserWithRelations = await this.userRepo.findOne(user.id, {
        relations: ['subreddits'],
      });

      res.status(200).send(newUserWithRelations);
    } catch (err) {
      console.log(`err => `, err);
      res.status(err.status || 400).send({ error: err.message });
    }
  }

  public async delete(
    req: Request,
    res: Response,
  ): Promise<(User & { deleted: boolean }) | void> {
    const { id } = req.params;

    let user;
    try {
      // Confirm that the user already exists
      const user = await this.userRepo.findOne(id, {
        relations: ['subreddits'],
      });

      if (!user) {
        res.status(404).send({ error: `User id ${id} not found` });
        return;
      }

      await this.userRepo.delete(user.id);

      res.status(200).send({ ...user, deleted: true });
      return { ...user, deleted: true };
    } catch (err) {
      console.log(`err => `, err);
      res.status(err.status || 400).send({ error: err.message });
    }
  }
}
