import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { RatingReviewsPageOptionsDto } from 'src/rating-review/dto';
import { BookService } from './book.service';
import {
  AddRatingReviewToBookDto,
  BookPageOptionsDto,
  CreateBookInput,
  RatingReviewInBookPageOptionsDto,
} from './dto';

@Controller('/api/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  async createBook(@Body() dto: CreateBookInput) {
    return this.bookService.createBook(dto);
  }

  @Get()
  async getBooks(@Query() dto: BookPageOptionsDto) {
    return this.bookService.getBooks(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get(':id')
  async getBookById(
    @Param('id', ParseIntPipe) id: number,
    @Query() reviewsDto: RatingReviewsPageOptionsDto,
  ) {
    return this.bookService.getBookById(id, reviewsDto);
  }

  @Get('slug/:slug')
  async getBookBySlug(@Param('slug') slug: string) {
    return this.bookService.getBookBySlug(slug);
  }

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
