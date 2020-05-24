import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity.entity';
import { Subreddit } from './subreddit.entity';

@Entity()
export class User extends BaseEntity {
  // Email address of the user
  // This will be unique throughout our system
  // This value cannot be updated
  @Column({ unique: true, update: false })
  public emailAddress: string;

  // First name of the user (optional)
  @Column({ nullable: true })
  public firstName?: string;

  // Last name of the user (optional)
  @Column({ nullable: true })
  public lastName: string;

  // Describes whether or not user is subscribed to email
  // User must be created with this set to true
  @Column({ type: 'boolean', default: true, insert: false })
  public isSubscribed: boolean;

  @OneToMany(type => Subreddit, subreddit => subreddit.user)
  public subreddits: Subreddit[];
}
