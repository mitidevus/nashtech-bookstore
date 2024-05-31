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
import { UserRole } from '@prisma/client';

import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_TYPES_REGEX } from 'constants/image';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { BookService } from 'src/book/book.service';
import { BooksPageOptionsDto } from 'src/book/dto';
import { AuthorService } from './author.service';
import {
  AddBooksToAuthorDto,
  AuthorPageOptionsDto,
  CreateAuthorDto,
  UpdateAuthorDto,
} from './dto';

@Controller('/api/authors')
export class AuthorController {
  constructor(
    private readonly authorService: AuthorService,
    private readonly bookService: BookService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createAuthor(
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
    return this.authorService.createAuthor(dto, image);
  }

  @Get()
  getAuthors(@Query() dto: AuthorPageOptionsDto) {
    return this.authorService.getAuthors(dto);
  }

  @Get(':id')
  getAuthorById(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.getAuthorById(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return await this.authorService.updateAuthor(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.deleteAuthor(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post(':id/books')
  async addBooksToAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToAuthorDto,
  ) {
    return await this.authorService.addBooksToAuthor(id, dto);
  }

  @Get(':slug/books')
  async getBooksByAuthorSlug(
    @Param('slug') slug: string,
    @Query() dto: BooksPageOptionsDto,
  ) {
    return this.bookService.getBooksByAuthorSlug(slug, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':authorId/books/:bookId')
  async removeBookFromAuthor(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.authorService.removeBookFromAuthor(authorId, bookId);
  }
}
