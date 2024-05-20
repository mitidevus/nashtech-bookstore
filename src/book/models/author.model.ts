import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Author')
export class Author {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
