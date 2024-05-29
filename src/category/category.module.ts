import { Module } from '@nestjs/common';
import { CategoryViewController } from './category-view.controller';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController, CategoryViewController],
  providers: [CategoryService],
})
export class CategoryModule {}
