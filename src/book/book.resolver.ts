import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGqlGuard, RolesGqlGuard } from 'src/auth/guard';
import { BookService } from './book.service';
import { CreateBookInput, FindAllBooksInput, UpdateBookInput } from './dto';
import { Book, BookList } from './models/book.model';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => BookList)
  async books(@Args('input') dto: FindAllBooksInput) {
    return await this.bookService.getBooks(dto);
  }

  @UseGuards(JwtGqlGuard, RolesGqlGuard)
  @Roles(UserRole.admin)
  @Mutation(() => Book)
  async createBook(@Args('input') dto: CreateBookInput) {
    return await this.bookService.createBook(dto);
  }

  @UseGuards(JwtGqlGuard, RolesGqlGuard)
  @Roles(UserRole.admin)
  @Mutation(() => Book)
  async updateBook(
    @Args('id', {
      type: () => Int,
    })
    id: number,
    @Args('input') dto: UpdateBookInput,
  ) {
    return await this.bookService.updateBook(id, dto);
  }

  @UseGuards(JwtGqlGuard, RolesGqlGuard)
  @Roles(UserRole.admin)
  @Mutation(() => [Book])
  async deleteBook(
    @Args('id', {
      type: () => Int,
    })
    id: number,
  ) {
    return await this.bookService.deleteBook(id);
  }
}
