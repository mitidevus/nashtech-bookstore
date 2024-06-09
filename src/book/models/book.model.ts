import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Author } from './author.model';
import { Category } from './category.model';

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
  finalPrice: number;

  @Field(() => Float)
  avgStars: number;

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

  @Field(() => [Category])
  categories: Category[];

  @Field(() => [Author])
  authors: Author[];
}

@ObjectType('BookList')
export class BookList {
  @Field(() => [Book])
  data: Book[];

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalCount: number;
}
