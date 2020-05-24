import { SubredditPostItem } from './subreddit-post-item.interface';

export interface SubredditItem {
  name: string;
  link: string;
  data: SubredditPostItem[];
}
