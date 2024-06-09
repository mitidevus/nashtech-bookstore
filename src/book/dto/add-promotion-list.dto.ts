import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddPromoListToBookDto {
  @IsNumber()
  @IsNotEmpty()
  promotionListId: number;
}
