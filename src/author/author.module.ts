import { Module } from '@nestjs/common';
import { BookService } from 'src/book/book.service';
import { AuthorViewController } from './author-view.controller';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';

@Module({
  providers: [AuthorService, BookService],
  controllers: [AuthorController, AuthorViewController],
})
export class AuthorModule {}
