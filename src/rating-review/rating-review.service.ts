import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRatingReviewDto } from './dto';

@Injectable()
export class RatingReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRatingReview(userId: string, dto: CreateRatingReviewDto) {
    const book = await this.prismaService.book.findUnique({
      where: { id: dto.bookId },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const newTotalReviews = book.totalReviews + 1;
        const newAvgStars =
          (book.avgStars * book.totalReviews + dto.star) / newTotalReviews;

        await tx.book.update({
          where: { id: dto.bookId },
          data: {
            avgStars: newAvgStars,
            totalReviews: newTotalReviews,
          },
        });

        const ratingReview = await tx.ratingReview.create({
          data: {
            userId,
            bookId: dto.bookId,
            star: dto.star,
            content: dto.content,
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
        message: 'Failed to create rating review',
      });
    }
  }
}
