import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';

@Injectable()
export class PromotionListService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPromotionList(dto: CreatePromotionListDto) {
    const promotionListExist = await this.prismaService.promotionList.findFirst(
      {
        where: {
          name: dto.name,
        },
      },
    );

    if (promotionListExist) {
      throw new BadRequestException({
        message: 'Promotion list already exists',
      });
    }

    try {
      const promotionList = await this.prismaService.promotionList.create({
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
        },
        include: {
          books: true,
        },
      });

      return promotionList;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to create promotion list',
      });
    }
  }

  async getPromotionLists(dto: PromotionListPageOptionsDto) {
    const conditions = {
      orderBy: [
        {
          createdAt: dto.order,
        },
      ],
    };

    const pageOption =
      dto.page && dto.take
        ? {
            skip: dto.skip,
            take: dto.take,
          }
        : undefined;

    const [promotionLists, totalCount] = await Promise.all([
      this.prismaService.promotionList.findMany({
        ...conditions,
        ...pageOption,
      }),
      this.prismaService.promotionList.count({
        ...conditions,
      }),
    ]);

    return {
      data: promotionLists,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async getPromotionList(id: number) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
      include: {
        books: true,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    return promotionList;
  }

  async updatePromotionList(id: number, dto: UpdatePromotionListDto) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    const promotionListExist = await this.prismaService.promotionList.findFirst(
      {
        where: {
          name: dto.name,
        },
      },
    );

    if (promotionListExist) {
      throw new BadRequestException({
        message: 'Promotion list already exists',
      });
    }

    try {
      const promotionList = await this.prismaService.promotionList.update({
        where: {
          id,
        },
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
        },
        include: {
          books: true,
        },
      });

      return promotionList;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update promotion list',
      });
    }
  }
}
