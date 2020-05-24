import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Base entity. All other entities will extend this in order to get these attributes
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @CreateDateColumn()
  public createdAt?: Date;

  @UpdateDateColumn()
  public updatedAt?: Date;
}
