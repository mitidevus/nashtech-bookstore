import { ArrayMinSize, IsNotEmpty, IsNumber } from 'class-validator';

export class AddBooksToPromoListDto {
  @IsNumber()
  @IsNotEmpty()
  @ArrayMinSize(1)
  bookIds: number[];
}
