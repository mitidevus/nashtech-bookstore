import { Module } from '@nestjs/common';
import { PromotionListService } from './promotion-list.service';
import { PromotionListController } from './promotion-list.controller';

@Module({
  providers: [PromotionListService],
  controllers: [PromotionListController]
})
export class PromotionListModule {}
