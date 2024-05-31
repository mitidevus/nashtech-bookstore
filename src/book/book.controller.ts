import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { FILE_TYPES_REGEX } from 'constants/image';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { RatingReviewsPageOptionsDto } from 'src/rating-review/dto';
import { BookService } from './book.service';
import {
  AddRatingReviewToBookDto,
  BooksPageOptionsDto,
  CreateBookInput,
  RatingReviewInBookPageOptionsDto,
} from './dto';

@Controller('/api/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createBook(
    @Body() dto: CreateBookInput,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ) {
    return this.bookService.createBook(dto, image);
  }

  @Get()
  async getBooks(@Query() dto: BooksPageOptionsDto) {
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deleteBook(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.deleteBook(id);
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
