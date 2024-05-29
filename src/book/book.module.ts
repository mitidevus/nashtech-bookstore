import { Module } from '@nestjs/common';
import { AuthorService } from 'src/author/author.service';
import { CategoryService } from 'src/category/category.service';
import { PromotionListService } from 'src/promotion-list/promotion-list.service';
import { BookViewController } from './book-view.controller';
import { BookController } from './book.controller';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';

@Module({
  providers: [
    BookResolver,
    BookService,
    AuthorService,
    CategoryService,
    PromotionListService,
  ],
  controllers: [BookController, BookViewController],
})
export class BookModule {}
