import {
  Body,
  Controller,
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
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';
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

  @Get(':id')
  getPromotionList(@Param('id', ParseIntPipe) id: number) {
    return this.promotionListService.getPromotionList(id);
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
}
