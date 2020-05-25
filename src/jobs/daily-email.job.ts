import { Consumer } from 'sqs-consumer';
import { Repository } from 'typeorm';
import { Service, Inject } from 'typedi';
import { User } from '../entities/user.entity';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { RedditService } from '../services/reddit.service';
import { MessagingService } from '../services/messaging.service';

// This module listens to an SQS queue in order to notify our servers to send an
// email to our users about their favorite subreddit channels. We should implement with a FIFO
// queue, to ensure exactly-once processing of the event. The actual event can be triggered
// by a cloudwatch event, configured with a cronjob to fire every morning at 8am.
// Separating this out will ensure that our server receives the event every morning.
// If not, then will remain in SQS queue until we 'notify' it that we have responded successfully
// Must make sure that visibility timeout is adjusted to meet the needs of this function
@Service()
export class DailyEmailJob {
  private readonly queueUrl = process.env.SQS_DAILY_EMAIL_EVENT_URL;
  @InjectRepository(User)
  private readonly userRepo: Repository<User>;
  @Inject()
  private readonly redditService: RedditService;
  @Inject()
  private readonly messagingService: MessagingService;

  public startConsumer() {
    if (!!this.queueUrl) {
      // Initialize SQS consumer
      const consumer = Consumer.create({
        queueUrl: this.queueUrl,
        handleMessage: async message => {
          try {
            await this.fetchDataAndSendEmail();

            // Will take message out of queue when response is successful
            return 'We have responded successfully';
          } catch (err) {
            // TODO: If fail, then either notify admin or retry
            console.log(`err => `, err);
            return err.message;
          }
        },
      });

      consumer.on('error', err => {
        console.log(`err => `, err);
      });

      consumer.start();
    }
  }

  public async fetchDataAndSendEmail(): Promise<void> {
    const users = await this.fetchUsers();

    for (let user of users) {
      // Fetch top posts from subreddit for user
      const topPosts = (
        await Promise.all(
          user.subreddits.map(
            async ({ name }) => await this.redditService.getTopPosts(name),
          ),
        )
      ).filter(({ data }) => !!data.length);

      // Send email to user
      await this.messagingService.sendEmail(user, topPosts);
    }
  }

  // Fetch all subscribed users
  private async fetchUsers(): Promise<User[]> {
    try {
      return await this.userRepo
        .createQueryBuilder('user')
        .where('user.isSubscribed = TRUE')
        .leftJoinAndSelect('user.subreddits', 'subreddits')
        .getMany();
    } catch (err) {
      console.log(`err => `, err);
      return [];
    }
  }
}
