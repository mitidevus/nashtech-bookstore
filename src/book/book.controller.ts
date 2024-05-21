import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { BookService } from './book.service';
import {
  AddRatingReviewToBookDto,
  RatingReviewInBookPageOptionsDto,
} from './dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtGuard)
  @Post(':slug/rating-reviews')
  async createRatingReview(
    @GetUser('sub') userId: string,
    @Param('slug') slug: string,
    @Body() dto: AddRatingReviewToBookDto,
  ) {
    return this.bookService.createRatingReview(userId, slug, dto);
  }

  @Get(':slug/rating-reviews')
  async getRatingReviews(
    @Param('slug') slug: string,
    @Query() dto: RatingReviewInBookPageOptionsDto,
  ) {
    return this.bookService.getRatingReviewsBySlug(slug, dto);
  }
}
