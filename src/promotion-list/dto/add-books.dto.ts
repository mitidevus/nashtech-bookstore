import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class AddBooksToPromoListDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  bookIds: number[];
}
