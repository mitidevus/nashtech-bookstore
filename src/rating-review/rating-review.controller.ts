import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CreateRatingReviewDto } from './dto';
import { RatingReviewService } from './rating-review.service';

@Controller('rating-reviews')
export class RatingReviewController {
  constructor(private readonly ratingReviewService: RatingReviewService) {}

  @UseGuards(JwtGuard)
  @Post()
  async createRatingReview(
    @GetUser('sub') userId: string,
    @Body() dto: CreateRatingReviewDto,
  ) {
    return this.ratingReviewService.createRatingReview(userId, dto);
  }
}
