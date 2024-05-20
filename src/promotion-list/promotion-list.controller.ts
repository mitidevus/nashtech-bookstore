import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { CreatePromotionListDto, PromotionListPageOptionsDto } from './dto';
import { PromotionListService } from './promotion-list.service';

@Controller('promotion-lists')
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
}
