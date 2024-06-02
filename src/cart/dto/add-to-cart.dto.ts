import { IsInt, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}
