import channelItemTemplate from './channel-item.template';
import { User } from '../entities/user.entity';
import { SubredditItem } from '../interfaces/subreddit-item.interface';

export default (user: User, data: SubredditItem[]) => `
  <div>
    ${data.reduce((str, dataItem) => str + channelItemTemplate(dataItem), '')}
  </div>
`;
