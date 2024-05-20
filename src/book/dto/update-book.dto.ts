import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateBookInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  price?: number;

  @Field(() => [Int], { nullable: true })
  @IsArray()
  @IsOptional()
  categoryIds?: number[];

  @Field(() => [Int], { nullable: true })
  @IsArray()
  @IsOptional()
  authorIds?: number[];
}
