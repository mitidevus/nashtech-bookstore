import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { toDateTime } from 'src/utils';
import { CategoryService } from './category.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';
import { AddBooksToCategoryDto } from './dto/add-books.dto';

@Controller('/categories')
@UseFilters(AuthExceptionFilter)
export class CategoryViewController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('categories/list')
  async getCategoryListPage(@Query() dto: CategoryPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.categoryService.getCategories(dto);

    const result = {
      ...res,
      data: res.data.map((category) => {
        return {
          ...category,
          createdAt: toDateTime(category.createdAt),
          updatedAt: toDateTime(category.updatedAt),
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
  @Render('categories/detail')
  async getCategoryDetailPage(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryService.getCategoryById(id);

    const booksNotInCategory =
      await this.categoryService.getBooksNotInCategory(id);

    return {
      ...category,
      createdAt: toDateTime(category.createdAt),
      updatedAt: toDateTime(category.updatedAt),
      books: category.books.map((book) => {
        return {
          ...book,
          addedAt: toDateTime(book.addedAt),
        };
      }),
      booksNotInCategory,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post(':id/books')
  async addBooksToCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToCategoryDto,
  ) {
    return await this.categoryService.addBooksToCategory(id, dto);
  }

  @UseGuards(AuthenticatedGuard)
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
