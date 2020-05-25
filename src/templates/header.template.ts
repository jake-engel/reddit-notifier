import { User } from '../entities/user.entity';
import { SubredditItem } from '../interfaces/subreddit-item.interface';

export default (user: User, data: SubredditItem[]) => `
  <div>
    <div style="font-size: 50pt; color: #535353; text-align: center; padding-bottom: 120px; font-weight: 800;">
      Reddit Newsletter
    </div>
    <div style="font-size: 20pt; font-weight: 100;">
      <div>
        Hello ${user.firstName}${!!user.lastName ? ` ${user.lastName}` : ''},
      </div>
      <div>
        See yesterday's top voted posts from your favorite channel${data.length > 1 ? 's' : ''}
      </div>
    </div>
  </div>
`;
