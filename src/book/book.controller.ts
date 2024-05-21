import { Controller, Get, Param, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { RatingReviewInBookPageOptionsDto } from './dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':slug/rating-reviews')
  async getRatingReviews(
    @Param('slug') slug: string,
    @Query() dto: RatingReviewInBookPageOptionsDto,
  ) {
    return this.bookService.getRatingReviewsBySlug(slug, dto);
  }
}
