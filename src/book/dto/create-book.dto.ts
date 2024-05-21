import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @Field(() => [Int], { nullable: true })
  @IsArray()
  @IsOptional()
  categoryIds?: number[];

  @Field(() => [Int], { nullable: true })
  @IsArray()
  @IsOptional()
  authorIds?: number[];
}
