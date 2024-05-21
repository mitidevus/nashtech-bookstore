import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBookInput,
  FindAllBooksInput,
  RatingReviewInBookPageOptionsDto,
  UpdateBookInput,
} from './dto';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async getBooks(dto: FindAllBooksInput) {
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

    const [books, totalCount] = await Promise.all([
      this.prismaService.book.findMany({
        ...conditions,
        ...pageOption,
      }),
      this.prismaService.book.count({
        ...conditions,
      }),
    ]);

    return {
      data: books,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async createBook(dto: CreateBookInput) {
    const hasCategory = dto.categoryIds && dto.categoryIds.length > 0;
    const hasAuthor = dto.authorIds && dto.authorIds.length > 0;

    // Check if list of categories and authors are exist
    if (hasCategory) {
      const categories = await this.prismaService.category.findMany({
        where: { id: { in: dto.categoryIds } },
      });

      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('Invalid category');
      }
    }

    if (hasAuthor) {
      const authors = await this.prismaService.author.findMany({
        where: { id: { in: dto.authorIds } },
      });

      if (authors.length !== dto.authorIds.length) {
        throw new BadRequestException('Invalid author');
      }
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const newBook = await tx.book.create({
          data: {
            name: dto.name,
            description: dto.description,
            image: dto.image,
            price: dto.price,
          },
        });

        if (hasCategory) {
          await tx.bookCategory.createMany({
            data: dto.categoryIds.map((categoryId) => ({
              bookId: newBook.id,
              categoryId,
            })),
          });
        }

        if (hasAuthor) {
          await tx.bookAuthor.createMany({
            data: dto.authorIds.map((authorId) => ({
              bookId: newBook.id,
              authorId,
            })),
          });
        }

        const slug = `${slugify(dto.name, { lower: true })}_${newBook.id}`;

        const updatedBook = await tx.book.update({
          where: { id: newBook.id },
          data: { slug },
          include: {
            authors: {
              select: {
                author: true,
              },
            },
            categories: {
              select: {
                category: true,
              },
            },
          },
        });

        return updatedBook;
      });

      const categories = result.categories.map((item) => item.category);

      const authors = result.authors.map((item) => item.author);

      return {
        ...result,
        categories,
        authors,
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to create book',
      });
    }
  }

  async updateBook(id: number, dto: UpdateBookInput) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    // Check if list of categories and authors are exist
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.prismaService.category.findMany({
        where: { id: { in: dto.categoryIds } },
      });

      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('Invalid category');
      }
    }

    if (dto.authorIds && dto.authorIds.length > 0) {
      const authors = await this.prismaService.author.findMany({
        where: { id: { in: dto.authorIds } },
      });

      if (authors.length !== dto.authorIds.length) {
        throw new BadRequestException('Invalid author');
      }
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        if (dto.categoryIds && dto.categoryIds.length > 0) {
          await tx.bookCategory.deleteMany({
            where: { bookId: id },
          });

          await tx.bookCategory.createMany({
            data: dto.categoryIds.map((categoryId) => ({
              bookId: id,
              categoryId,
            })),
          });
        }

        if (dto.authorIds && dto.authorIds.length > 0) {
          await tx.bookAuthor.deleteMany({
            where: { bookId: id },
          });

          await tx.bookAuthor.createMany({
            data: dto.authorIds.map((authorId) => ({
              bookId: id,
              authorId,
            })),
          });
        }

        const updatedBook = await tx.book.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            image: dto.image,
            price: dto.price,
            slug: slugify(dto.name, { lower: true }),
          },
          include: {
            categories: {
              select: {
                category: true,
              },
            },
            authors: {
              select: {
                author: true,
              },
            },
          },
        });

        return updatedBook;
      });

      const categories = result.categories.map((item) => item.category);

      const authors = result.authors.map((item) => item.author);

      return {
        ...result,
        categories,
        authors,
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update book',
      });
    }
  }

  async deleteBook(id: number) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        await tx.bookCategory.deleteMany({
          where: { bookId: id },
        });

        await tx.bookAuthor.deleteMany({
          where: { bookId: id },
        });

        await tx.book.delete({
          where: { id },
        });

        return tx.book.findMany();
      });

      return result;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to delete book',
      });
    }
  }

  async getRatingReviewsBySlug(
    slug: string,
    dto: RatingReviewInBookPageOptionsDto,
  ) {
    const book = await this.prismaService.book.findUnique({
      where: { slug },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    const conditions = {
      where: {
        bookId: book.id,
      },
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

    const [ratingReviews, totalCount] = await Promise.all([
      this.prismaService.ratingReview.findMany({
        ...conditions,
        ...pageOption,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prismaService.ratingReview.count({
        ...conditions,
      }),
    ]);

    return {
      data: ratingReviews,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }
}
