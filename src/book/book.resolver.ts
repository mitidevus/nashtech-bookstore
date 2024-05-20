import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookService } from './book.service';
import { CreateBookInput } from './dto';
import { Book } from './models/book.model';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book])
  async books() {
    return this.bookService.getBooks();
  }

  @Mutation(() => Book)
  async createBook(@Args('data') dto: CreateBookInput) {
    return this.bookService.createBook(dto);
  }
}
