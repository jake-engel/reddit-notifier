import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity.entity';
import { User } from './user.entity';

@Entity()
export class Subreddit extends BaseEntity {
  @Column()
  public name: string; // Name of the subreddit

  @ManyToOne(type => User, user => user.subreddits, {
    onDelete: 'CASCADE',
  })
  public user: User;

  constructor(partial?: Partial<Subreddit>) {
    super();

    if (!!partial) {
      if (!!partial.name) this.name = partial.name;
      if (!!partial.user) this.user = partial.user;
    }
  }
}
