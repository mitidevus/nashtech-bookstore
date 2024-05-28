import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddBookToPromoListDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;
}
