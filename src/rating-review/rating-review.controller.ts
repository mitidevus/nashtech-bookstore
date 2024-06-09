import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { RatingReviewsPageOptionsDto } from './dto';
import { RatingReviewService } from './rating-review.service';

@Controller('/api/rating-reviews')
export class RatingReviewController {
  constructor(private readonly ratingReviewService: RatingReviewService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get()
  async getRatingReviews(@Body() dto: RatingReviewsPageOptionsDto) {
    return await this.ratingReviewService.getRatingReviews(dto);
  }
}
