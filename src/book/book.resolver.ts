import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Mutation(() => Book)
  async createBook(@Args('input') dto: CreateBookInput) {
    return this.bookService.createBook(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Mutation(() => [Book])
  async deleteBook(
    @Args('id', {
      type: () => Int,
    })
    id: number,
  ) {
    return this.bookService.deleteBook(id);
  }
}
