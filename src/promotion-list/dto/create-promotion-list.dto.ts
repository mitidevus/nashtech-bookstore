import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';
import { MAX_DISCOUNT_PERCENTAGE } from 'constants/promotion-list';

export class CreatePromotionListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  @Max(MAX_DISCOUNT_PERCENTAGE)
  @IsNotEmpty()
  discountPercentage: number;
}
