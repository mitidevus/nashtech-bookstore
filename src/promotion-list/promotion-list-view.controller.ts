import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { BookService } from 'src/book/book.service';
import { toDateTime } from 'src/utils';
import { CreatePromotionListDto, PromotionListPageOptionsDto } from './dto';
import { PromotionListService } from './promotion-list.service';

@Controller('/promotion-lists')
@UseFilters(AuthExceptionFilter)
export class PromotionListViewController {
  constructor(
    private readonly promotionListService: PromotionListService,
    private readonly bookService: BookService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  async createPromotionList(@Body() dto: CreatePromotionListDto) {
    return this.promotionListService.createPromotionList(dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
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
          createdAt: toDateTime(promotionList.createdAt),
          updatedAt: toDateTime(promotionList.updatedAt),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  @Render('promotion-lists/detail')
  async getPromotionListDetailPage(@Param('id', ParseIntPipe) id: number) {
    const promotionList =
      await this.promotionListService.getPromotionListById(id);

    const nonPromotionalBooks = await this.bookService.getNonPromotionalBooks();

    return {
      ...promotionList,
      createdAt: toDateTime(promotionList.createdAt),
      updatedAt: toDateTime(promotionList.updatedAt),
      books: promotionList.books.map((book) => {
        return {
          ...book,
          createdAt: toDateTime(book.createdAt),
          updatedAt: toDateTime(book.updatedAt),
        };
      }),
      nonPromotionalBooks,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async deletePromotionList(@Param('id', ParseIntPipe) id: number) {
    return await this.promotionListService.deletePromotionList(id);
  }

  // @UseGuards(AuthenticatedGuard)
  // @Post(':id/books')
  // async addBookToPromoList(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: AddBookToPromoListDto,
  // ) {
  //   return this.promotionListService.addBookToPromoList(id, dto);
  // }

  @UseGuards(AuthenticatedGuard)
  @Delete(':promotionListId/books/:bookId')
  async removeBookFromPromoList(
    @Param('promotionListId', ParseIntPipe) promotionListId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.promotionListService.removeBookFromPromoList(
      promotionListId,
      bookId,
    );
  }
}
