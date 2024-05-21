import { Module } from '@nestjs/common';
import { RatingReviewController } from './rating-review.controller';
import { RatingReviewService } from './rating-review.service';

@Module({
  controllers: [RatingReviewController],
  providers: [RatingReviewService]
})
export class RatingReviewModule {}
