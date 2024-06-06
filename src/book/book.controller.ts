import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { FILE_TYPES_REGEX } from 'src/constants/image';
import { RatingReviewsPageOptionsDto } from 'src/rating-review/dto';
import { BookService } from './book.service';
import {
  AddRatingReviewToBookDto,
  BooksPageOptionsDto,
  CreateBookDto,
  RatingReviewInBookPageOptionsDto,
  SpecialBooksPageOptionsDto,
  UpdateBookDto,
} from './dto';

@Controller('/api/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createBook(
    @Body() dto: CreateBookDto,
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
    return await this.bookService.createBook(dto, image);
  }

  @Get()
  async getBooks(@Query() dto: BooksPageOptionsDto) {
    return await this.bookService.getBooks(dto);
  }

  @Get('special')
  async getSpectialBooks(@Query() dto: SpecialBooksPageOptionsDto) {
    return await this.bookService.getSpecialBooks(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get(':id')
  async getBookById(
    @Param('id', ParseIntPipe) id: number,
    @Query() reviewsDto: RatingReviewsPageOptionsDto,
  ) {
    return await this.bookService.getBookById(id, reviewsDto);
  }

  @Get('slug/:slug')
  async getBookBySlug(@Param('slug') slug: string) {
    return await this.bookService.getBookBySlug(slug);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
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
    return await this.bookService.updateBook(id, dto, image);
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
    return await this.bookService.createRatingReview(userId, slug, dto);
  }

  @Get(':slug/rating-reviews')
  async getRatingReviews(
    @Param('slug') slug: string,
    @Query() dto: RatingReviewInBookPageOptionsDto,
  ) {
    return await this.bookService.getRatingReviewsBySlug(slug, dto);
  }
}
