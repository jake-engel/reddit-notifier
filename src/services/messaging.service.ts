import { User } from '../entities/user.entity';
import { Service } from 'typedi';
import { SubredditItem } from '../interfaces/subreddit-item.interface';
import html from '../templates/layout.template'

@Service()
export class MessagingService {
  public async sendEmail(user: User, data: SubredditItem[]): Promise<boolean> {
    console.log(`user => `, user);
    console.log(`data => `, data);

    return true;
  }
}
