import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { ArrayMinSize, IsArray, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  image: string;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  categoryIds: number[];

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  authorIds: number[];
}
