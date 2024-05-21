import { Controller } from '@nestjs/common';
import { RatingReviewService } from './rating-review.service';

@Controller('rating-reviews')
export class RatingReviewController {
  constructor(private readonly ratingReviewService: RatingReviewService) {}
}
