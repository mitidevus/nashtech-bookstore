import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class AddAuthorsToBookDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  authorIds: number[];
}
