import { User } from '../entities/user.entity';
import { SubredditItem } from '../interfaces/subreddit-item.interface';
import channelPostItemTemplate from './channel-post-item.template';

export default (dataItem: SubredditItem) => `
  <div class="channel-item">
    <div style="border: 2px solid black; color: #535353; text-decoration:none; padding: 5px;">
      <span style="font-size: 25pt; font-weight: 800; text-transform: capitalize;">
        ${dataItem.name}:
      </span>
      <a
        style="font-size: 18pt; font-weight: 600;"
        href="${dataItem.link}"
      >
        ${dataItem.link}
      </a>
    </div>
    <div>
      ${dataItem.data.reduce((str, item) => str + channelPostItemTemplate(item), '')}
    </div>
  </div>
`;
