import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MAX_QUANTITY_PER_ITEM } from 'constants/order';

class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(MAX_QUANTITY_PER_ITEM)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
