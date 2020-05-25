import { User } from '../entities/user.entity';
import { Service } from 'typedi';
import { SubredditItem } from '../interfaces/subreddit-item.interface';
import htmlTemplate from '../templates/layout.template';
import sgMail from '@sendgrid/mail';

@Service()
export class MessagingService {
  private readonly emailApi = sgMail;

  constructor() {
    this.emailApi.setApiKey(<string>process.env.SENDGRID_API_KEY);
  }

  public async sendEmail(
    user: User,
    data: SubredditItem[],
  ): Promise<{ error?: any }> {
    const message = this.constructMessage(user, data);
    try {
      await this.emailApi.send(message);
      return {};
    } catch (err) {
      console.log(`err => `, err);
      return { error: err };
    }
  }

  private constructMessage(
    user: User,
    data: SubredditItem[],
  ): sgMail.MailDataRequired {
    const html = htmlTemplate(user, data);

    return {
      to: user.emailAddress,
      from: 'reddit-notifier@reddit-notifier.com',
      subject: `Your favorite subreddits`,
      html,
    };
  }

  private constructHtml(user: User, data: SubredditItem[]) {
    return htmlTemplate(user, data);
  }
}
