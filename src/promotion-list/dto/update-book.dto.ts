import { IsNumber, IsOptional, IsPositive, Max } from 'class-validator';
import { MAX_DISCOUNT_PERCENTAGE } from 'constants/promotion-list';

export class UpdateBookInPromoListDto {
  @IsNumber()
  @IsPositive()
  @Max(MAX_DISCOUNT_PERCENTAGE)
  @IsOptional()
  discountPercentage?: number;
}
