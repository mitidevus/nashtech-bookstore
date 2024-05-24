import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RatingReviewsPageOptionsDto } from './dto';

@Injectable()
export class RatingReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async getRatingReviews(dto: RatingReviewsPageOptionsDto) {
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

    const [ratingReviews, totalCount] = await Promise.all([
      this.prismaService.ratingReview.findMany({
        ...conditions,
        ...pageOption,
        include: {
          book: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
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
      data: ratingReviews,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }
}
