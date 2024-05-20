import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookInput } from './dto';
import { FindAllBooksInput } from './dto/find-all-books.dto';
import { UpdateBookInput } from './dto/update-book.dto';

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
    // Check if list of categories and authors are exist
    const [categories, authors] = await Promise.all([
      this.prismaService.category.findMany({
        where: { id: { in: dto.categoryIds } },
      }),
      this.prismaService.author.findMany({
        where: { id: { in: dto.authorIds } },
      }),
    ]);

    if (categories.length !== dto.categoryIds.length) {
      throw new BadRequestException('Invalid category');
    }

    if (authors.length !== dto.authorIds.length) {
      throw new BadRequestException('Invalid author');
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const newBook = await tx.book.create({
          data: {
            name: dto.name,
            description: dto.description,
            image: dto.image,
            price: dto.price,
            discountPrice: 0,
            discountPercentage: 0,
            totalStars: 0,
            totalReviews: 0,
            soldQuantity: 0,
            categories: {
              create: dto.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
            authors: {
              create: dto.authorIds.map((authorId) => ({
                authorId,
              })),
            },
          },
        });

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
}
