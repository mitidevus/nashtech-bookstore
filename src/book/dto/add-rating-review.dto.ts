import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddRatingReviewToBookDto {
  @IsNumber()
  @IsNotEmpty()
  star: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
