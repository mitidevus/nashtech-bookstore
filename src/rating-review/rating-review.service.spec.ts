import { Test, TestingModule } from '@nestjs/testing';
import { Order } from 'src/constants/app';
import { PrismaService } from 'src/prisma/prisma.service';
import { RatingReviewsPageOptionsDto } from './dto';
import { RatingReviewService } from './rating-review.service';

describe('RatingReviewService', () => {
  let service: RatingReviewService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingReviewService,
        {
          provide: PrismaService,
          useValue: {
            ratingReview: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RatingReviewService>(RatingReviewService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRatingReviews', () => {
    it('should return rating reviews with pagination', async () => {
      const dto: RatingReviewsPageOptionsDto = {
        page: 1,
        take: 10,
        order: Order.ASC,
        skip: 0,
      };

      const mockRatingReviews = [
        {
          id: 1,
          rating: 5,
          review: 'Great book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 1,
            name: 'Book 1',
            image: 'image-url-1',
          },
          user: {
            id: 1,
            name: 'User 1',
            email: 'user1@example.com',
          },
        },
        {
          id: 2,
          rating: 4,
          review: 'Good book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 2,
            name: 'Book 2',
            image: 'image-url-2',
          },
          user: {
            id: 2,
            name: 'User 2',
            email: 'user2@example.com',
          },
        },
      ];
      const totalCount = mockRatingReviews.length;

      (prismaService.ratingReview.findMany as jest.Mock).mockResolvedValue(
        mockRatingReviews,
      );
      (prismaService.ratingReview.count as jest.Mock).mockResolvedValue(
        totalCount,
      );

      const result = await service.getRatingReviews(dto);

      expect(result).toEqual({
        data: mockRatingReviews,
        totalPages: 1,
        totalCount,
      });
      expect(prismaService.ratingReview.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
        skip: dto.skip,
        take: dto.take,
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
      });
      expect(prismaService.ratingReview.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should return rating reviews without pagination', async () => {
      const dto: RatingReviewsPageOptionsDto = {
        order: Order.ASC,
        skip: undefined,
      };

      const mockRatingReviews = [
        {
          id: 1,
          rating: 5,
          review: 'Great book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 1,
            name: 'Book 1',
            image: 'image-url-1',
          },
          user: {
            id: 1,
            name: 'User 1',
            email: 'user1@example.com',
          },
        },
        {
          id: 2,
          rating: 4,
          review: 'Good book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 2,
            name: 'Book 2',
            image: 'image-url-2',
          },
          user: {
            id: 2,
            name: 'User 2',
            email: 'user2@example.com',
          },
        },
      ];
      const totalCount = mockRatingReviews.length;

      (prismaService.ratingReview.findMany as jest.Mock).mockResolvedValue(
        mockRatingReviews,
      );
      (prismaService.ratingReview.count as jest.Mock).mockResolvedValue(
        totalCount,
      );

      const result = await service.getRatingReviews(dto);

      expect(result).toEqual({
        data: mockRatingReviews,
        totalPages: 1,
        totalCount,
      });
      expect(prismaService.ratingReview.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
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
      });
      expect(prismaService.ratingReview.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should return an empty array if there are no rating reviews', async () => {
      const dto: RatingReviewsPageOptionsDto = {
        page: 1,
        take: 10,
        order: Order.ASC,
        skip: 0,
      };

      (prismaService.ratingReview.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.ratingReview.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getRatingReviews(dto);

      expect(result).toEqual({
        data: [],
        totalPages: 0,
        totalCount: 0,
      });

      expect(prismaService.ratingReview.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
        skip: dto.skip,
        take: dto.take,
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
      });

      expect(prismaService.ratingReview.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should handle case when only page is provided', async () => {
      const dto: RatingReviewsPageOptionsDto = {
        page: 1,
        order: Order.ASC,
        skip: undefined,
      };

      const mockRatingReviews = [
        {
          id: 1,
          rating: 5,
          review: 'Great book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 1,
            name: 'Book 1',
            image: 'image-url-1',
          },
          user: {
            id: 1,
            name: 'User 1',
            email: 'user1@example.com',
          },
        },
        {
          id: 2,
          rating: 4,
          review: 'Good book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 2,
            name: 'Book 2',
            image: 'image-url-2',
          },
          user: {
            id: 2,
            name: 'User 2',
            email: 'user2@example.com',
          },
        },
      ];
      const totalCount = mockRatingReviews.length;

      (prismaService.ratingReview.findMany as jest.Mock).mockResolvedValue(
        mockRatingReviews,
      );
      (prismaService.ratingReview.count as jest.Mock).mockResolvedValue(
        totalCount,
      );

      const result = await service.getRatingReviews(dto);

      expect(result).toEqual({
        data: mockRatingReviews,
        totalPages: 1,
        totalCount,
      });

      expect(prismaService.ratingReview.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
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
      });

      expect(prismaService.ratingReview.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should handle case when there are more reviews than take', async () => {
      const dto: RatingReviewsPageOptionsDto = {
        page: 1,
        take: 1,
        order: Order.ASC,
        skip: 0,
      };

      const mockRatingReviews = [
        {
          id: 1,
          rating: 5,
          review: 'Great book!',
          createdAt: '2024-05-26T06:48:39.913Z',
          updatedAt: '2024-05-26T06:48:39.913Z',
          book: {
            id: 1,
            name: 'Book 1',
            image: 'image-url-1',
          },
          user: {
            id: 1,
            name: 'User 1',
            email: 'user1@example.com',
          },
        },
      ];
      const totalCount = 2;

      (prismaService.ratingReview.findMany as jest.Mock).mockResolvedValue(
        mockRatingReviews,
      );
      (prismaService.ratingReview.count as jest.Mock).mockResolvedValue(
        totalCount,
      );

      const result = await service.getRatingReviews(dto);

      expect(result).toEqual({
        data: mockRatingReviews,
        totalPages: 2,
        totalCount,
      });

      expect(prismaService.ratingReview.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
        skip: dto.skip,
        take: dto.take,
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
      });

      expect(prismaService.ratingReview.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
      });
    });
  });
});
