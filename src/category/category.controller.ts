import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { BookService } from 'src/book/book.service';
import { BooksPageOptionsDto } from 'src/book/dto';
import { CategoryService } from './category.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';
import { AddBooksToCategoryDto } from './dto/add-books.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/api/categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly bookService: BookService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }

  @Get()
  async getCategories(@Query() dto: CategoryPageOptionsDto) {
    return await this.categoryService.getCategories(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get(':id')
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.getCategoryById(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateCategory(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post(':id/books')
  async addBooksToCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToCategoryDto,
  ) {
    return await this.categoryService.addBooksToCategory(id, dto);
  }

  @Get(':slug/books')
  async getBooksByCategorySlug(
    @Param('slug') slug: string,
    @Query() dto: BooksPageOptionsDto,
  ) {
    return await this.bookService.getBooksByCategorySlug(slug, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':categoryId/books/:bookId')
  async removeBookFromCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.categoryService.removeBookFromCategory(
      categoryId,
      bookId,
    );
  }
}
