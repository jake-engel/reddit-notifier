import { User } from '../entities/user.entity';
import { SubredditItem } from '../interfaces/subreddit-item.interface';
import headerTemplate from './header.template';
import channelTemplate from './channel.template';

export default (user: User, data: SubredditItem[]) => `
  <div>
    ${headerTemplate(user, data)}
    <div style="display: flex; justify-content: center; align-items: center; width: 80%">
      ${channelTemplate(user, data)}
    </div>
  </div>
`;
