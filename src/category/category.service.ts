import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    const categoryExist = await this.prismaService.category.findFirst({
      where: {
        name: dto.name,
      },
    });

    if (categoryExist) {
      throw new BadRequestException({
        message: 'Category already exists',
      });
    }

    try {
      const category = await this.prismaService.category.create({
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
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
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async getCategoryById(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
      include: {
        books: {
          select: {
            book: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    return {
      ...category,
      books: category.books.map((item) => item.book),
    };
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    if (!Object.keys(dto).length) {
      throw new BadRequestException({
        message: 'No data provided',
      });
    }

    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    const categoryExist = await this.prismaService.category.findFirst({
      where: {
        name: dto.name,
      },
    });

    if (categoryExist) {
      throw new BadRequestException({
        message: 'Category already exists',
      });
    }

    try {
      const updatedCategory = await this.prismaService.category.update({
        where: {
          id,
        },
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
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

  async deleteCategory(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    try {
      await this.prismaService.category.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Deleted category successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to delete category',
      });
    }
  }
}
