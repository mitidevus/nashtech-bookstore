import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookService } from './book.service';
import { CreateBookInput } from './dto';
import { FindAllBooksInput } from './dto/find-all-books.dto';
import { UpdateBookInput } from './dto/update-book.dto';
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

  @Mutation(() => Book)
  async updateBook(
    @Args('id', {
      type: () => Int,
    })
    id: number,
    @Args('input') dto: UpdateBookInput,
  ) {
    return this.bookService.updateBook(id, dto);
  }
}
