import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { CreatePromotionListDto } from './dto';
import { PromotionListService } from './promotion-list.service';

@Controller('promotion-lists')
export class PromotionListController {
  constructor(private readonly promotionListService: PromotionListService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  createAuthor(@Body() dto: CreatePromotionListDto) {
    return this.promotionListService.createPromotionList(dto);
  }
}
