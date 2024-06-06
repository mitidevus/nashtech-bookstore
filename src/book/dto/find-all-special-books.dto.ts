import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { MAX_ITEMS_PER_PAGE, Order, SpecialBook } from 'src/constants/app';

export class SpecialBooksPageOptionsDto {
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

  @IsEnum(SpecialBook)
  @IsNotEmpty()
  type: SpecialBook;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
