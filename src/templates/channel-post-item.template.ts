import { SubredditPostItem } from '../interfaces/subreddit-post-item.interface';

export default (dataItem: SubredditPostItem) => `
  <div style="padding-bottom: 50px;">
    <img
      src="${dataItem.thumbnail}"
      alt="${dataItem.title}"
      style="width: 95%; height: 500px;"
    />
    <div style="display: inline-flex; width: 90%; min-height: 100px; ">
      <div style="color: white; background-color: orange; font-size: 30px; font-weight: 900; border-radius: 50%; min-width: 100px; height: 100px; width: 100px; padding: 2px; text-align: center; line-height: 100px;">
        ${dataItem.ups > 1000 ? `${Math.round(dataItem.ups / 1000)}K` : dataItem.ups}
      </div>
      <div style="font-size: 24px; text-align: center;">
        ${dataItem.title}
      </div>
    </div>
  </div>
`;
