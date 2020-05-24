import { User } from '../entities/user.entity';
import { IsEmail, IsOptional, IsString, IsArray } from 'class-validator';

// Omit favoriteSubreddits so we can override type
export class CreateUserInput
  implements Partial<Omit<User, 'favoriteSubreddits'>> {
  @IsEmail()
  public emailAddress: string;

  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsString({ each: true })
  public favoriteSubreddits: string[];

  constructor(partial?: Partial<CreateUserInput>) {
    if (!!partial?.emailAddress) this.emailAddress = partial.emailAddress;

    if (!!partial?.firstName) this.firstName = partial.firstName;

    if (!!partial?.lastName) this.lastName = partial.lastName;

    if (!!partial?.favoriteSubreddits)
      this.favoriteSubreddits = partial.favoriteSubreddits;
  }
}
