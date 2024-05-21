import { PartialType } from '@nestjs/mapped-types';
import { CreatePromotionListDto } from './create-promotion-list.dto';

export class UpdatePromotionListDto extends PartialType(
  CreatePromotionListDto,
) {}
