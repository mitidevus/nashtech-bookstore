import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_BOOK_IMAGE_URL, sortMapping } from 'constants/app';
import { EUploadFolder } from 'constants/image';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { RatingReviewsPageOptionsDto } from 'src/rating-review/dto';
import { deleteFilesFromFirebase } from 'src/services/files/delete';
import { uploadFilesFromFirebase } from 'src/services/files/upload';
import { calculateDiscountedPrice } from 'src/utils';
import {
  AddRatingReviewToBookDto,
  BooksPageOptionsDto,
  CreateBookInput,
  FindAllBooksInput,
  RatingReviewInBookPageOptionsDto,
  UpdateBookInput,
} from './dto';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBook(dto: CreateBookInput, image?: Express.Multer.File) {
    const hasCategory = dto.categoryIds && dto.categoryIds.length > 0;
    const hasAuthor = dto.authorIds && dto.authorIds.length > 0;

    let categoryIds = [];
    let authorIds = [];

    if (hasCategory) {
      categoryIds = dto.categoryIds.split(',').map(Number);

      // Remove duplicates
      categoryIds = [...new Set(categoryIds)];

      const categories = await this.prismaService.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Invalid category');
      }
    }

    if (hasAuthor) {
      authorIds = dto.authorIds.split(',').map(Number);

      // Remove duplicates
      authorIds = [...new Set(authorIds)];

      const authors = await this.prismaService.author.findMany({
        where: { id: { in: authorIds } },
      });

      if (authors.length !== authorIds.length) {
        throw new BadRequestException('Invalid author');
      }
    }

    const price = Number(dto.price);
    if (isNaN(price)) {
      throw new BadRequestException('Price must be a number!');
    }

    let imageUrls = [];

    try {
      if (image && image.buffer.byteLength > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          [image],
          EUploadFolder.book,
        );

        if (!uploadImagesData.success) {
          throw new Error('Failed to upload images!');
        }

        imageUrls = uploadImagesData.urls;
      }

      const result = await this.prismaService.$transaction(async (tx) => {
        const newBook = await tx.book.create({
          data: {
            name: dto.name,
            description: dto.description,
            image: imageUrls.length ? imageUrls[0] : DEFAULT_BOOK_IMAGE_URL,
            price: price,
            finalPrice: price,
          },
        });

        if (hasCategory) {
          await tx.bookCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              bookId: newBook.id,
              categoryId,
            })),
          });
        }

        if (hasAuthor) {
          await tx.bookAuthor.createMany({
            data: authorIds.map((authorId) => ({
              bookId: newBook.id,
              authorId,
            })),
          });
        }

        const slug = `${slugify(dto.name, { lower: true, locale: 'vi' })}_${newBook.id}`;

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

      if (image && !imageUrls.length) await deleteFilesFromFirebase(imageUrls);

      throw new BadRequestException({
        message: 'Failed to create book',
      });
    }
  }

  async getBooks(dto: FindAllBooksInput) {
    const sortOrder = sortMapping[dto.sort];

    const conditions = {
      orderBy: [...(sortOrder ? [sortOrder] : []), { createdAt: dto.order }],
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
        include: {
          promotionList: true,
          authors: {
            select: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.book.count({
        ...conditions,
      }),
    ]);

    return {
      data: books.map((book) => ({
        ...book,
        authors: book.authors.map((item) => item.author),
        categories: book.categories.map((item) => item.category),
      })),
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async getNonPromotionalBooks() {
    return await this.prismaService.book.findMany({
      where: {
        promotionListId: null,
      },
    });
  }

  async getBookById(id: number, reviewsDto: RatingReviewsPageOptionsDto) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
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
        promotionList: true,
      },
    });

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    const conditions = {
      where: {
        bookId: id,
      },
      orderBy: [
        {
          createdAt: reviewsDto.order,
        },
      ],
    };

    const pageOption =
      reviewsDto.page && reviewsDto.take
        ? {
            skip: reviewsDto.skip,
            take: reviewsDto.take,
          }
        : undefined;

    const [ratingReviews, totalCount] = await Promise.all([
      this.prismaService.ratingReview.findMany({
        ...conditions,
        ...pageOption,
        include: {
          user: {
            select: {
              id: true,
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
      ...book,
      authors: book.authors.map((item) => item.author),
      categories: book.categories.map((item) => item.category),
      ratingReviews: {
        data: ratingReviews,
        totalPages: reviewsDto.take
          ? Math.ceil(totalCount / reviewsDto.take)
          : 1,
        totalCount,
      },
    };
  }

  async getBookBySlug(slug: string) {
    const book = await this.prismaService.book.findUnique({
      where: { slug },
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

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    return {
      ...book,
      authors: book.authors.map((item) => item.author),
      categories: book.categories.map((item) => item.category),
    };
  }

  async updateBook(id: number, dto: UpdateBookInput) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: {
        promotionList: true,
      },
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

        let finalPrice;
        if (book.promotionListId) {
          finalPrice = calculateDiscountedPrice(
            dto.price,
            book.promotionList.discountPercentage,
          );
        }

        const updatedBook = await tx.book.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            image: dto.image,
            price: dto.price,
            finalPrice,
            slug: slugify(dto.name, { lower: true, locale: 'vi' }),
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
      await this.prismaService.book.delete({
        where: { id },
      });

      return await this.prismaService.book.findMany();
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to delete book',
      });
    }
  }

  async createRatingReview(
    userId: string,
    slug: string,
    dto: AddRatingReviewToBookDto,
  ) {
    const book = await this.prismaService.book.findUnique({
      where: { slug },
    });

    if (!book) {
      throw new BadRequestException({
        message: 'Book not found',
      });
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const newTotalReviews = book.totalReviews + 1;
        const newAvgStars =
          (book.avgStars * book.totalReviews + dto.star) / newTotalReviews;

        await tx.book.update({
          where: { id: book.id },
          data: {
            avgStars: newAvgStars,
            totalReviews: newTotalReviews,
          },
        });

        const ratingReview = await tx.ratingReview.create({
          data: {
            userId,
            bookId: book.id,
            ...dto,
          },
          include: {
            book: true,
          },
        });

        return ratingReview;
      });

      return result;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to add rating review',
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
      throw new BadRequestException({
        message: 'Book not found',
      });
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

  async getBooksByCategorySlug(slug: string, dto: BooksPageOptionsDto) {
    const category = await this.prismaService.category.findFirst({
      where: {
        slug,
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    const sortOrder = sortMapping[dto.sort];

    const conditions = {
      where: {
        categories: {
          some: {
            categoryId: category.id,
          },
        },
      },
      orderBy: [...(sortOrder ? [sortOrder] : []), { createdAt: dto.order }],
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
        include: {
          promotionList: true,
          authors: {
            select: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        ...pageOption,
      }),
      this.prismaService.book.count({
        ...conditions,
      }),
    ]);

    return {
      ...category,
      books: {
        data: books.map((book) => ({
          ...book,
          authors: book.authors.map((item) => item.author),
          categories: book.categories.map((item) => item.category),
        })),
        totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
        totalCount,
      },
    };
  }

  async getBooksByAuthorSlug(slug: string, dto: BooksPageOptionsDto) {
    const author = await this.prismaService.author.findFirst({
      where: {
        slug,
      },
    });

    if (!author) {
      throw new NotFoundException({
        message: 'Author not found',
      });
    }

    const sortOrder = sortMapping[dto.sort];

    const conditions = {
      where: {
        authors: {
          some: {
            authorId: author.id,
          },
        },
      },
      orderBy: [...(sortOrder ? [sortOrder] : []), { createdAt: dto.order }],
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
        include: {
          promotionList: true,
          authors: {
            select: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        ...pageOption,
      }),
      this.prismaService.book.count({
        ...conditions,
      }),
    ]);

    return {
      ...author,
      books: {
        data: books.map((book) => ({
          ...book,
          authors: book.authors.map((item) => item.author),
          categories: book.categories.map((item) => item.category),
        })),
        totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
        totalCount,
      },
    };
  }
}
