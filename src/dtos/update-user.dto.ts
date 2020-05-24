import { User } from '../entities/user.entity';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUserInput implements Partial<User> {
  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsOptional()
  @IsBoolean()
  public isSubscribed?: boolean;

  @IsString({ each: true })
  @IsOptional()
  public favoriteSubreddits?: string[];

  constructor(partial?: Partial<UpdateUserInput>) {
    if (!!partial?.firstName) this.firstName = partial.firstName;

    if (!!partial?.lastName) this.lastName = partial.lastName;

    if (!!partial?.isSubscribed) this.isSubscribed = partial.isSubscribed;

    if (!!partial?.favoriteSubreddits)
      this.favoriteSubreddits = partial.favoriteSubreddits;
  }
}
