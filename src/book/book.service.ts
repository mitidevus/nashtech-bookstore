import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookInput } from './dto';
import { FindAllBooksInput } from './dto/find-all-books.dto';

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
          include: {
            authors: true,
            categories: true,
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
}
