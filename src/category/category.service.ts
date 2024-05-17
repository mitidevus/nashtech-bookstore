import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
      this.prismaService.category.count({
        ...conditions,
      }),
    ]);

    return {
      data: categories,
      totalPages: Math.ceil(totalCount / dto.take),
      totalCount,
    };
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'category not found',
      });
    }

    try {
      const updatedCategory = await this.prismaService.category.update({
        where: {
          id,
        },
        data: {
          name: dto.name,
        },
      });

      return updatedCategory;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update category',
      });
    }
  }
}
