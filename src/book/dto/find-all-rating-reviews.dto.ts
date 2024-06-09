import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_ITEMS_PER_PAGE, Order } from 'src/constants/app';

export class RatingReviewInBookPageOptionsDto {
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ITEMS_PER_PAGE)
  @IsOptional()
  take?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  star?: number;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
