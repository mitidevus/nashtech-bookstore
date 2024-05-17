import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Book')
export class Book {
  @Field(() => ID)
  id: number;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  image: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  discountPrice: number;

  @Field(() => Float)
  discountPercentage: number;

  @Field(() => Float)
  totalStars: number;

  @Field(() => Int)
  totalReviews: number;

  @Field(() => Int)
  soldQuantity: number;

  @Field(() => Int, { nullable: true })
  promotionListId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
