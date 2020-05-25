import axios from 'axios';
import { Service } from 'typedi';
import { SubredditPostItem } from '../interfaces/subreddit-post-item.interface';
import { SubredditItem } from '../interfaces/subreddit-item.interface';

@Service()
export class RedditService {
  private readonly baseUrl = 'https://www.reddit.com';
  private readonly defaultThumbnail =
    'https://user-images.githubusercontent.com/101482/29592647-40da86ca-875a-11e7-8bc3-941700b0a323.png';

  public async getTopPosts(name): Promise<SubredditItem> {
    try {
      const data = (
        await axios.get(`${this.baseUrl}/r/${name}/top.json`, {
          params: {
            limit: 3, // We only want the top 3 posts
          },
        })
      )?.data?.data?.children;

      return this.formatData(name, data);
    } catch (err) {
      // TODO: Implement retry logic
      console.log(`err => `, err);
      throw err;
    }
  }

  private formatData(name, data): SubredditItem {
    return {
      name,
      link: `${this.baseUrl}/r/${name}/top`,
      data: data?.map(dataItem => this.formatDataItem(dataItem)) ?? [],
    };
  }

  private formatDataItem(dataItem: any): SubredditPostItem {
    // Either display image URL or empty image icon
    let thumbnail = dataItem.data.thumbnail || this.defaultThumbnail;

    // Check that thumbnail is in correct format
    if (!/^(http(s?):)\/\/[\w\s-.\/|]*\.(?:jpg|gif|png)$/.test(thumbnail))
      thumbnail = this.defaultThumbnail;

    return {
      ups: dataItem.data.ups,
      title: dataItem.data.title,
      thumbnail,
    };
  }
}
