import { Module } from '@nestjs/common';
import { BookService } from 'src/book/book.service';
import { PromotionListViewController } from './promotion-list-view.controller';
import { PromotionListController } from './promotion-list.controller';
import { PromotionListService } from './promotion-list.service';

@Module({
  providers: [PromotionListService, BookService],
  controllers: [PromotionListController, PromotionListViewController],
})
export class PromotionListModule {}
