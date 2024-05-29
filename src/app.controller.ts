import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  Render,
  Request,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { FILE_TYPES_REGEX } from 'constants/image';
import { Response } from 'express';
import { AuthExceptionFilter } from './auth/filters';
import {
  AuthenticatedGuard,
  LoginGuard,
  UnauthenticatedGuard,
} from './auth/guard';
import { AuthorService } from './author/author.service';
import {
  AddBooksToAuthorDto,
  AuthorPageOptionsDto,
  CreateAuthorDto,
} from './author/dto';
import { BookService } from './book/book.service';
import { CreateBookInput, FindAllBooksInput } from './book/dto';
import { CategoryService } from './category/category.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './category/dto';
import { AddBooksToCategoryDto } from './category/dto/add-books.dto';
import { OrderPageOptionsDto } from './order/dto';
import { OrderService } from './order/order.service';
import {
  AddBookToPromoListDto,
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
} from './promotion-list/dto';
import { PromotionListService } from './promotion-list/promotion-list.service';
import { RatingReviewsPageOptionsDto } from './rating-review/dto';
import { RatingReviewService } from './rating-review/rating-review.service';
import { UserPageOptionsDto } from './user/dto';
import { UserService } from './user/user.service';
import { formatCurrency, toTimeDate } from './utils';

@Controller()
@UseFilters(AuthExceptionFilter)
export class AppController {
  constructor(
    private readonly authorService: AuthorService,
    private readonly categoryService: CategoryService,
    private readonly promotionListService: PromotionListService,
    private readonly orderService: OrderService,
    private readonly ratingReviewService: RatingReviewService,
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) {}

  @UseGuards(UnauthenticatedGuard)
  @Get('/login')
  @Render('login')
  index(@Request() req): { message: string } {
    return { message: req.flash('loginError') };
  }

  @UseGuards(LoginGuard)
  @Post('/login')
  login(@Res() res: Response): void {
    res.redirect('/');
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('index')
  root(@Request() req) {
    return { user: req.user };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/authors')
  @Render('authors/list')
  async getAuthorListPage(@Query() dto: AuthorPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.authorService.getAuthors(dto);

    const result = {
      ...res,
      data: res.data.map((author) => {
        return {
          ...author,
          createdAt: toTimeDate(author.createdAt),
          updatedAt: toTimeDate(author.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/authors/:id')
  @Render('authors/detail')
  async getAuthorDetailPage(@Param('id', ParseIntPipe) id: number) {
    const author = await this.authorService.getAuthorById(id);

    const booksNotInAuthor = await this.authorService.getBooksNotInAuthor(id);

    return {
      ...author,
      createdAt: toTimeDate(author.createdAt),
      updatedAt: toTimeDate(author.updatedAt),
      books: author.books.map((book) => {
        return {
          ...book,
          addedAt: toTimeDate(book.addedAt),
        };
      }),
      booksNotInAuthor,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/authors')
  @UseInterceptors(FileInterceptor('image'))
  createAuthor(
    @Body() dto: CreateAuthorDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ) {
    return this.authorService.createAuthor(dto, image);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/authors/:id/books')
  async addBooksToAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToAuthorDto,
  ) {
    return await this.authorService.addBooksToAuthor(id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('/authors/:authorId/books/:bookId')
  async removeBookFromAuthor(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.authorService.removeBookFromAuthor(authorId, bookId);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('/authors/:id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.deleteAuthor(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/categories')
  @Render('categories/list')
  async getCategoryListPage(@Query() dto: CategoryPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.categoryService.getCategories(dto);

    const result = {
      ...res,
      data: res.data.map((category) => {
        return {
          ...category,
          createdAt: toTimeDate(category.createdAt),
          updatedAt: toTimeDate(category.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/categories/:id')
  @Render('categories/detail')
  async getCategoryDetailPage(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryService.getCategoryById(id);

    const booksNotInCategory =
      await this.categoryService.getBooksNotInCategory(id);

    return {
      ...category,
      createdAt: toTimeDate(category.createdAt),
      updatedAt: toTimeDate(category.updatedAt),
      books: category.books.map((book) => {
        return {
          ...book,
          addedAt: toTimeDate(book.addedAt),
        };
      }),
      booksNotInCategory,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/categories/:id/books')
  async addBooksToCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToCategoryDto,
  ) {
    return await this.categoryService.addBooksToCategory(id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('/categories/:categoryId/books/:bookId')
  async removeBookFromCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.categoryService.removeBookFromCategory(
      categoryId,
      bookId,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('/categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(id);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/promotion-lists')
  @Render('promotion-lists/list')
  async getPromotionListsPage(@Query() dto: PromotionListPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.promotionListService.getPromotionLists(dto);

    const result = {
      ...res,
      data: res.data.map((promotionList) => {
        return {
          ...promotionList,
          createdAt: toTimeDate(promotionList.createdAt),
          updatedAt: toTimeDate(promotionList.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/promotion-lists/:id')
  @Render('promotion-lists/detail')
  async getPromotionListDetailPage(@Param('id', ParseIntPipe) id: number) {
    const promotionList =
      await this.promotionListService.getPromotionListById(id);

    const nonPromotionalBooks = await this.bookService.getNonPromotionalBooks();

    return {
      ...promotionList,
      createdAt: toTimeDate(promotionList.createdAt),
      updatedAt: toTimeDate(promotionList.updatedAt),
      books: promotionList.books.map((book) => {
        return {
          ...book,
          createdAt: toTimeDate(book.createdAt),
          updatedAt: toTimeDate(book.updatedAt),
        };
      }),
      nonPromotionalBooks,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/promotion-lists')
  createPromotionList(@Body() dto: CreatePromotionListDto) {
    return this.promotionListService.createPromotionList(dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/promotion-lists/:id/books')
  addBookToPromoList(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBookToPromoListDto,
  ) {
    return this.promotionListService.addBookToPromoList(id, dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('/promotion-lists/:promotionListId/books/:bookId')
  async removeBookFromPromotionList(
    @Param('promotionListId', ParseIntPipe) promotionListId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.promotionListService.removeBookFromPromotionList(
      promotionListId,
      bookId,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/orders')
  @Render('orders/list')
  async getOrdersPage(@Query() dto: OrderPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.orderService.getOrders(dto);

    const result = {
      ...res,
      data: res.data.map((order) => {
        return {
          ...order,
          createdAt: toTimeDate(order.createdAt),
          updatedAt: toTimeDate(order.updatedAt),
          totalPrice: formatCurrency(order.totalPrice * 1000),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/orders/:id')
  @Render('orders/detail')
  async getOrderDetailPage(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);

    return {
      ...order,
      createdAt: toTimeDate(order.createdAt),
      updatedAt: toTimeDate(order.updatedAt),
      totalPrice: formatCurrency(order.totalPrice * 1000),
      items: order.items.map((item) => {
        return {
          ...item,
          price: formatCurrency(item.price * 1000),
          discountPrice:
            item.discountPrice > 0
              ? formatCurrency(item.discountPrice * 1000)
              : null,
          totalPrice: formatCurrency(item.totalPrice * 1000),
        };
      }),
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/rating-reviews')
  @Render('rating-reviews/list')
  async getRatingReviewsPage(@Query() dto: RatingReviewsPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.ratingReviewService.getRatingReviews(dto);

    const result = {
      ...res,
      data: res.data.map((ratingReview) => {
        return {
          ...ratingReview,
          createdAt: toTimeDate(ratingReview.createdAt),
          updatedAt: toTimeDate(ratingReview.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/customers')
  @Render('users/list')
  async getUsersPage(@Query() dto: UserPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;
    dto.role = UserRole.user;

    const res = await this.userService.getUsers(dto);

    const result = {
      ...res,
      data: res.data.map((user) => {
        return {
          ...user,
          createdAt: toTimeDate(user.createdAt),
          updatedAt: toTimeDate(user.updatedAt),
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/customers/:id')
  @Render('users/detail')
  async getUserDetailPage(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);

    return {
      ...user,
      createdAt: toTimeDate(user.createdAt),
      updatedAt: toTimeDate(user.updatedAt),
      orders: user.orders.map((order) => {
        return {
          ...order,
          createdAt: toTimeDate(order.createdAt),
          updatedAt: toTimeDate(order.updatedAt),
          totalPrice: formatCurrency(order.totalPrice * 1000),
        };
      }),
      ratingReviews: user.ratingReviews.map((ratingReview) => {
        return {
          ...ratingReview,
          createdAt: toTimeDate(ratingReview.createdAt),
          updatedAt: toTimeDate(ratingReview.updatedAt),
        };
      }),
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/books')
  @Render('books/list')
  async getBooksPage(@Query() dto: FindAllBooksInput) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

    const res = await this.bookService.getBooks(dto);

    const categories = await this.categoryService.getAllCategories();
    const authors = await this.authorService.getAllAuthors();

    const result = {
      ...res,
      data: res.data.map((book) => {
        return {
          ...book,
          createdAt: toTimeDate(book.createdAt),
          updatedAt: toTimeDate(book.updatedAt),
          price: formatCurrency(book.price * 1000),
          discountPrice:
            book.discountPrice > 0
              ? formatCurrency(book.discountPrice * 1000)
              : null,
        };
      }),
      categories,
      authors,
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/books/:id')
  @Render('books/detail')
  async getBookDetailPage(
    @Param('id', ParseIntPipe) id: number,
    @Query() reviewsDto: RatingReviewsPageOptionsDto,
  ) {
    const book = await this.bookService.getBookById(id, reviewsDto);

    let promos = [];
    if (!book.promotionListId) {
      promos = (await this.promotionListService.getAllPromotionLists()).map(
        (promo) => ({
          id: promo.id,
          name: promo.name + ' - ' + promo.discountPercentage + '%',
        }),
      );
    }

    return {
      ...book,
      createdAt: toTimeDate(book.createdAt),
      updatedAt: toTimeDate(book.updatedAt),
      price: formatCurrency(book.price * 1000),
      discountPrice:
        book.discountPrice > 0
          ? formatCurrency(book.discountPrice * 1000)
          : null,
      discountDate: toTimeDate(book.discountDate),
      ratingReviews: {
        ...book.ratingReviews,
        data: book.ratingReviews.data.map((ratingReview) => {
          return {
            ...ratingReview,
            createdAt: toTimeDate(ratingReview.createdAt),
          };
        }),
        currentPage: reviewsDto.page || 1,
      },
      promos,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/books')
  @UseInterceptors(FileInterceptor('image'))
  createBook(
    @Body() dto: CreateBookInput,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ) {
    return this.bookService.createBook(dto, image);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/logout')
  logout(@Request() req, @Res() res: Response): void {
    req.logout((error) => {
      if (error) {
        console.error('Logout error', error);
        res.status(500).send('An error occurred during logout');
      } else {
        res.redirect('/login');
      }
    });
  }
}
