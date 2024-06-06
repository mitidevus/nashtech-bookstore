import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { BookService } from 'src/book/book.service';
import { BooksPageOptionsDto } from 'src/book/dto';
import {
  AddBooksToPromoListDto,
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';
import { PromotionListService } from './promotion-list.service';

@Controller('/api/promotion-lists')
export class PromotionListController {
  constructor(
    private readonly promotionListService: PromotionListService,
    private readonly bookService: BookService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  async createPromotionList(@Body() dto: CreatePromotionListDto) {
    return await this.promotionListService.createPromotionList(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get()
  async getPromotionLists(@Query() dto: PromotionListPageOptionsDto) {
    return await this.promotionListService.getPromotionLists(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get(':id')
  async getPromotionListById(@Param('id', ParseIntPipe) id: number) {
    return await this.promotionListService.getPromotionListById(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  async updatePromotionList(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionListDto,
  ) {
    return await this.promotionListService.updatePromotionList(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deletePromotionList(@Param('id', ParseIntPipe) id: number) {
    return await this.promotionListService.deletePromotionList(id);
  }

  @Get(':slug/books')
  async getBooksFromPromoListBySlug(
    @Param('slug') slug: string,
    @Query() dto: BooksPageOptionsDto,
  ) {
    return await this.bookService.getBooksByPromoListSlug(slug, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post(':id/books')
  async addBookToPromoList(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBooksToPromoListDto,
  ) {
    return await this.promotionListService.addBooksToPromoList(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':promoId/books/:bookId')
  async removeBookFromPromoList(
    @Param('promoId', ParseIntPipe) promoId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.promotionListService.removeBookFromPromoList(
      promoId,
      bookId,
    );
  }
}
