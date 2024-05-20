import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookService } from './book.service';
import { CreateBookInput } from './dto';
import { FindAllBooksInput } from './dto/find-all-books.dto';
import { Book, BookList } from './models/book.model';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => BookList)
  async books(@Args('input') dto: FindAllBooksInput) {
    return this.bookService.getBooks(dto);
  }

  @Mutation(() => Book)
  async createBook(@Args('input') dto: CreateBookInput) {
    return this.bookService.createBook(dto);
  }
}
