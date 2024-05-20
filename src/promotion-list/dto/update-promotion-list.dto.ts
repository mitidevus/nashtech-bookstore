import { IsOptional, IsString } from 'class-validator';

export class UpdatePromotionListDto {
  @IsString()
  @IsOptional()
  name?: string;
}
