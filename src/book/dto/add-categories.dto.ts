import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class AddCategoriesToBookDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  categoryIds: number[];
}
