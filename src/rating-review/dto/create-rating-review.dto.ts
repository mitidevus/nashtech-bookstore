import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRatingReviewDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsNumber()
  @IsNotEmpty()
  star: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
