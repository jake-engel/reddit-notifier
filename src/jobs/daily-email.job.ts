import { Consumer } from 'sqs-consumer';
import { Repository } from 'typeorm';
import { Service, Inject } from 'typedi';
import { User } from '../entities/user.entity';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { RedditService } from '../services/reddit.service';

// This module listens to an SQS queue in order to notify our servers to send an
// email to our users about their favorite subreddit channels. We should implement with a FIFO
// queue, to ensure exactly-once processing of the event. The actual event can be triggered
// by a cloudwatch event, configured with a cronjob to fire every morning at 8am.
// Separating this out will ensure that our server receives the event every morning.
// If not, then will remain in SQS queue until we 'notify' it that we have responded successfully
@Service()
export class DailyEmailJob {
  private readonly queueUrl = process.env.SQS_DAILY_EMAIL_EVENT_URL;
  @InjectRepository(User)
  private readonly userRepo: Repository<User>;
  @Inject()
  private readonly redditService: RedditService;

  public startConsumer() {
    if (!!this.queueUrl) {
      const consumer = Consumer.create({
        queueUrl: this.queueUrl,
        handleMessage: async message => {
          try {
            await this.fetchDataAndSendEmail();
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

  public async fetchDataAndSendEmail() {
    const users = await this.fetchUsers();

    const promises = [];
  }

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
