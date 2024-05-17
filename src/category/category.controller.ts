import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { CategoryService } from './category.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  getAuthors(@Query() dto: CategoryPageOptionsDto) {
    return this.categoryService.getCategories(dto);
  }
}
