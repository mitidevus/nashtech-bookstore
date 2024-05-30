import { Module } from '@nestjs/common';
import { BookService } from 'src/book/book.service';
import { CategoryViewController } from './category-view.controller';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController, CategoryViewController],
  providers: [CategoryService, BookService],
})
export class CategoryModule {}
