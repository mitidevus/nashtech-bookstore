import { IsNotEmpty, IsNumber, IsPositive, Max } from 'class-validator';
import { MAX_DISCOUNT_PERCENTAGE } from 'constants/promotion-list';

export class AddBookToPromoListDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsNumber()
  @IsPositive()
  @Max(MAX_DISCOUNT_PERCENTAGE)
  @IsNotEmpty()
  discountPercentage: number;
}
