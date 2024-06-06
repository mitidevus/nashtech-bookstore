import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryPageOptionsDto, CreateCategoryDto } from './dto';
import { AddBooksToCategoryDto } from './dto/add-books.dto';
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
            locale: 'vi',
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

  async getAllCategories() {
    return await this.prismaService.category.findMany();
  }

  async getCategoryById(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
      include: {
        books: {
          select: {
            book: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
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
      books: category.books.map((item) => ({
        ...item.book,
        addedAt: item.createdAt,
      })),
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
            locale: 'vi',
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

  async addBooksToCategory(id: number, dto: AddBooksToCategoryDto) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new BadRequestException({
        message: 'Category not found',
      });
    }

    const books = await this.prismaService.book.findMany({
      where: { id: { in: dto.bookIds } },
    });

    if (books.length !== dto.bookIds.length) {
      throw new BadRequestException('Invalid book');
    }

    const bookCategory = await this.prismaService.bookCategory.findMany({
      where: {
        categoryId: id,
        bookId: {
          in: dto.bookIds,
        },
      },
    });

    if (bookCategory.length) {
      throw new BadRequestException({
        message: 'There are some books already in this category',
      });
    }

    try {
      await this.prismaService.bookCategory.createMany({
        data: dto.bookIds.map((bookId) => ({
          bookId,
          categoryId: id,
        })),
      });

      return {
        message: 'Added books to category successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to add books to category',
      });
    }
  }

  async getBooksNotInCategory(categoryId: number) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException({
        message: 'Category not found',
      });
    }

    const books = await this.prismaService.book.findMany({
      where: {
        NOT: {
          categories: {
            some: {
              categoryId,
            },
          },
        },
      },
    });

    return books;
  }

  async removeBookFromCategory(categoryId: number, bookId: number) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException({
        message: 'Category not found',
      });
    }

    const bookCategory = await this.prismaService.bookCategory.findFirst({
      where: {
        categoryId,
        bookId,
      },
    });

    if (!bookCategory) {
      throw new BadRequestException({
        message: 'Book not found in this category',
      });
    }

    try {
      await this.prismaService.bookCategory.delete({
        where: {
          bookId_categoryId: {
            bookId,
            categoryId,
          },
        },
      });

      return {
        message: 'Removed book from category successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to remove book from category',
      });
    }
  }

  async getCategoriesNotInBook(bookId: number) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new BadRequestException({
        message: 'Book not found',
      });
    }

    const categories = await this.prismaService.category.findMany({
      where: {
        NOT: {
          books: {
            some: {
              bookId,
            },
          },
        },
      },
    });

    return categories;
  }
}
