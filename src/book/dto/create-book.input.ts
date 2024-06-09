import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

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
  price: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorIds?: string;
}
