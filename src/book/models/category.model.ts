import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Category')
export class Category {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
