import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookInput } from './dto';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async getBooks() {
    return await this.prismaService.book.findMany();
  }

  async createBook(dto: CreateBookInput) {
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
          },
        });

        const slug = `${slugify(dto.name, { lower: true })}_${newBook.id}`;

        const updatedBook = await tx.book.update({
          where: { id: newBook.id },
          data: { slug },
        });

        return updatedBook;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        message: 'Failed to create book',
      });
    }
  }
}
