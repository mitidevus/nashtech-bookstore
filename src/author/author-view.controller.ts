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
  Render,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { FILE_TYPES_REGEX } from 'constants/image';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { toDateTime } from 'src/utils';
import { AuthorService } from './author.service';
import {
  AddBooksToAuthorDto,
  AuthorPageOptionsDto,
  CreateAuthorDto,
  UpdateAuthorDto,
} from './dto';

@Controller('/authors')
@UseFilters(AuthExceptionFilter)
export class AuthorViewController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createAuthor(
    @Body() dto: CreateAuthorDto,
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
    return await this.authorService.createAuthor(dto, image);
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('authors/list')
  async getAuthorListPage(@Query() dto: AuthorPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.authorService.getAuthors(dto);

    const result = {
      ...res,
      data: res.data.map((author) => {
        return {
          ...author,
          createdAt: toDateTime(author.createdAt),
          updatedAt: toDateTime(author.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  @Render('authors/detail')
  async getAuthorDetailPage(@Param('id', ParseIntPipe) id: number) {
    const author = await this.authorService.getAuthorById(id);

    const booksNotInAuthor = await this.authorService.getBooksNotInAuthor(id);

    return {
      ...author,
      createdAt: toDateTime(author.createdAt),
      updatedAt: toDateTime(author.updatedAt),
      books: author.books.map((book) => {
        return {
          ...book,
          addedAt: toDateTime(book.addedAt),
        };
      }),
      booksNotInAuthor,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id/edit')
  @Render('authors/edit')
  async getEditAuthorDetailPage(@Param('id', ParseIntPipe) id: number) {
    const author = await this.authorService.getAuthorById(id);

    return {
      ...author,
      createdAt: toDateTime(author.createdAt),
      updatedAt: toDateTime(author.updatedAt),
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
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
    return await this.authorService.updateAuthor(id, dto, image);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.deleteAuthor(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post(':id/books')
  async addBooksToAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToAuthorDto,
  ) {
    return await this.authorService.addBooksToAuthor(id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':authorId/books/:bookId')
  async removeBookFromAuthor(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.authorService.removeBookFromAuthor(authorId, bookId);
  }
}
