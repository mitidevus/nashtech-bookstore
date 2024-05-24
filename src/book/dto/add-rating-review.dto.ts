import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddRatingReviewToBookDto {
  @IsNumber()
  @IsNotEmpty()
  star: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
