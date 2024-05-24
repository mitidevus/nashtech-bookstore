import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Request,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE, DateFormat } from 'constants/app';
import { Response } from 'express';
import { AuthExceptionFilter } from './auth/filters';
import {
  AuthenticatedGuard,
  LoginGuard,
  UnauthenticatedGuard,
} from './auth/guard';
import { AuthorService } from './author/author.service';
import { AuthorPageOptionsDto, CreateAuthorDto } from './author/dto';
import { CategoryService } from './category/category.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './category/dto';
import { OrderPageOptionsDto } from './order/dto';
import { OrderService } from './order/order.service';
import {
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
} from './promotion-list/dto';
import { PromotionListService } from './promotion-list/promotion-list.service';
import { formatDate } from './utils';

@Controller()
@UseFilters(AuthExceptionFilter)
export class AppController {
  constructor(
    private readonly authorService: AuthorService,
    private readonly categoryService: CategoryService,
    private readonly promotionListService: PromotionListService,
    private readonly orderService: OrderService,
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
          createdAt: formatDate({
            date: author.createdAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
          updatedAt: formatDate({
            date: author.updatedAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/authors')
  createAuthor(@Body() dto: CreateAuthorDto) {
    return this.authorService.createAuthor(dto);
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
          createdAt: formatDate({
            date: category.createdAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
          updatedAt: formatDate({
            date: category.updatedAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
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
          createdAt: formatDate({
            date: promotionList.createdAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
          updatedAt: formatDate({
            date: promotionList.updatedAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/promotion-lists')
  createPromotionList(@Body() dto: CreatePromotionListDto) {
    return this.promotionListService.createPromotionList(dto);
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
          createdAt: formatDate({
            date: order.createdAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
          updatedAt: formatDate({
            date: order.updatedAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
          totalPrice: new Intl.NumberFormat('us-EN', {
            style: 'currency',
            currency: 'VND',
          }).format(order.totalPrice * 1000),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

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
