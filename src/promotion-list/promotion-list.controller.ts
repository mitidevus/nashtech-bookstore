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
import {
  AddBookToPromoListDto,
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';
import { BookInPromoListPageOptionsDto } from './dto/find-all-books.dto';
import { PromotionListService } from './promotion-list.service';

@Controller('/api/promotion-lists')
export class PromotionListController {
  constructor(private readonly promotionListService: PromotionListService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  createPromotionList(@Body() dto: CreatePromotionListDto) {
    return this.promotionListService.createPromotionList(dto);
  }

  @Get()
  getPromotionLists(@Query() dto: PromotionListPageOptionsDto) {
    return this.promotionListService.getPromotionLists(dto);
  }

  @Get(':id')
  getPromotionListById(@Param('id', ParseIntPipe) id: number) {
    return this.promotionListService.getPromotionListById(id);
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post(':id/books')
  async addBookToPromoList(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBookToPromoListDto,
  ) {
    return await this.promotionListService.addBookToPromoList(id, dto);
  }

  @Get(':slug/books')
  async getBooksFromPromoListBySlug(
    @Param('slug') slug: string,
    @Query() dto: BookInPromoListPageOptionsDto,
  ) {
    return await this.promotionListService.getBooksFromPromoListBySlug(
      slug,
      dto,
    );
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
