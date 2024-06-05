import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_ITEMS_PER_PAGE, Order, SortBy, SpecialBook } from 'constants/app';

export class BooksPageOptionsDto {
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @IsEnum(SortBy)
  @IsOptional()
  sort?: SortBy;

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
  @IsOptional()
  type?: SpecialBook;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  search?: string;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
