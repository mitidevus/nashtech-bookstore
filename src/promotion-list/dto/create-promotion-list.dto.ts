import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePromotionListDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
