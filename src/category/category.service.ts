import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    try {
      const category = await this.prismaService.category.create({
        data: {
          ...dto,
        },
      });

      return category;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to create category',
      });
    }
  }

  async getCategories(dto: CategoryPageOptionsDto) {
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

    const [categories, totalCount] = await Promise.all([
      this.prismaService.category.findMany({
        ...conditions,
        ...pageOption,
      }),
      this.prismaService.author.count({
        ...conditions,
      }),
    ]);

    return {
      data: categories,
      totalPages: Math.ceil(totalCount / dto.take),
      totalCount,
    };
  }
}
