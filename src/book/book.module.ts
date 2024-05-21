import { Module } from '@nestjs/common';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';
import { BookController } from './book.controller';

@Module({
  providers: [BookResolver, BookService],
  controllers: [BookController],
})
export class BookModule {}
