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
import { CategoryService } from './category.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';
import { AddBooksToCategoryDto } from './dto/add-books.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  getCategories(@Query() dto: CategoryPageOptionsDto) {
    return this.categoryService.getCategories(dto);
  }

  @Get(':id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getCategoryById(id);
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
}
