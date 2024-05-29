import {
  Controller,
  Get,
  Query,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { toDateTime } from 'src/utils';
import { RatingReviewsPageOptionsDto } from './dto';
import { RatingReviewService } from './rating-review.service';

@Controller('/rating-reviews')
@UseFilters(AuthExceptionFilter)
export class RatingReviewViewController {
  constructor(private readonly ratingReviewService: RatingReviewService) {}

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('rating-reviews/list')
  async getRatingReviewsPage(@Query() dto: RatingReviewsPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.ratingReviewService.getRatingReviews(dto);

    const result = {
      ...res,
      data: res.data.map((ratingReview) => {
        return {
          ...ratingReview,
          createdAt: toDateTime(ratingReview.createdAt),
          updatedAt: toDateTime(ratingReview.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }
}
