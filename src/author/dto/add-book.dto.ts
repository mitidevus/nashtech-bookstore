import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class AddBooksToAuthorDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  bookIds: number[];
}
