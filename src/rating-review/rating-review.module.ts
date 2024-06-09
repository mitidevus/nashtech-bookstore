import { Module } from '@nestjs/common';
import { RatingReviewViewController } from './rating-review-view.controller';
import { RatingReviewController } from './rating-review.controller';
import { RatingReviewService } from './rating-review.service';

@Module({
  controllers: [RatingReviewController, RatingReviewViewController],
  providers: [RatingReviewService],
})
export class RatingReviewModule {}
