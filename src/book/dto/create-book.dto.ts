import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

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
}
