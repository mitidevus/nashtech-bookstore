import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Order } from 'src/constants/app';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddBooksToPromoListDto,
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';
import { PromotionListService } from './promotion-list.service';

describe('PromotionListService', () => {
  let service: PromotionListService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionListService,
        {
          provide: PrismaService,
          useValue: {
            promotionList: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            book: {
              findMany: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PromotionListService>(PromotionListService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPromotionList', () => {
    it('should create a new promotion list', async () => {
      const dto: CreatePromotionListDto = {
        name: 'Test Promotion List',
        discountPercentage: 10,
      };

      (prismaService.promotionList.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaService.promotionList.create as jest.Mock).mockResolvedValue(dto);

      const result = await service.createPromotionList(dto);

      expect(result).toEqual(dto);
      expect(prismaService.promotionList.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          discountPercentage: dto.discountPercentage,
        }),
        include: { books: true },
      });
    });

    it('should throw an error if discountPercentage is not an integer', async () => {
      const dto: CreatePromotionListDto = {
        name: 'Test Promotion List',
        discountPercentage: 10.5,
      };

      await expect(service.createPromotionList(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.promotionList.create).not.toHaveBeenCalled();
    });

    it('should throw an error if promotion list already exists', async () => {
      const dto: CreatePromotionListDto = {
        name: 'Test Promotion List',
        discountPercentage: 10,
      };

      (prismaService.promotionList.findFirst as jest.Mock).mockResolvedValue(
        dto,
      );

      await expect(service.createPromotionList(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.promotionList.create).not.toHaveBeenCalled();
    });
  });

  describe('getPromotionLists', () => {
    it('should return promotion lists with pagination', async () => {
      const dto: PromotionListPageOptionsDto = {
        page: 1,
        take: 10,
        order: Order.ASC,
        skip: 0,
      };

      const mockPromotionLists = [
        { id: 1, name: 'Promotion List 1' },
        { id: 2, name: 'Promotion List 2' },
      ];
      const totalCount = mockPromotionLists.length;

      (prismaService.promotionList.findMany as jest.Mock).mockResolvedValue(
        mockPromotionLists,
      );
      (prismaService.promotionList.count as jest.Mock).mockResolvedValue(
        totalCount,
      );

      const result = await service.getPromotionLists(dto);

      expect(result).toEqual({
        data: mockPromotionLists,
        totalPages: 1,
        totalCount,
      });
      expect(prismaService.promotionList.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
        skip: dto.skip,
        take: dto.take,
      });
      expect(prismaService.promotionList.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: dto.order }],
      });
    });
  });

  describe('getPromotionListById', () => {
    it('should return a promotion list by id', async () => {
      const id = 1;
      const mockPromotionList = {
        id: 1,
        name: 'On sale',
        createdAt: '2024-05-26T06:48:39.913Z',
        updatedAt: '2024-05-26T06:48:39.913Z',
        slug: 'on-sale',
        discountPercentage: 30,
        books: [
          {
            id: 2,
            name: 'Thám Tử Lừng Danh Conan - Tập 15',
            image:
              'https://salt.tikicdn.com/cache/750x750/ts/product/fe/bc/ee/9f50440f8febb594607864b510c5c6ee.jpg.webp',
            discountDate: '2024-06-06T09:41:06.722Z',
          },
          {
            id: 22,
            name: 'SÁCH THIẾU NHI CHO TRẺ 2-3 TUỔI_TOÁN HỌC_Số - Tư duy (2~3 tuổi)',
            image:
              'https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1717495095127-book5.jpg?alt=media',
            discountDate: '2024-06-06T04:40:15.093Z',
          },
        ],
      };

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        mockPromotionList,
      );

      const result = await service.getPromotionListById(id);

      expect(result).toEqual(mockPromotionList);
      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          books: {
            select: { id: true, name: true, image: true, discountDate: true },
          },
        },
      });
    });

    it('should throw an error if promotion list not found', async () => {
      const id = 1;

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.getPromotionListById(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          books: {
            select: { id: true, name: true, image: true, discountDate: true },
          },
        },
      });
    });
  });

  describe('updatePromotionList', () => {
    it('should update promotion list successfully', async () => {
      const id = 1;
      const dto: UpdatePromotionListDto = {
        name: 'Updated Promotion List',
        discountPercentage: 20,
      };
      const mockPromotionList = {
        id,
        name: 'Old Promotion List',
        discountPercentage: 10,
        books: [{ id: 1, price: 100 }],
      };
      const updatedPromotionList = {
        ...mockPromotionList,
        ...dto,
      };

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        mockPromotionList,
      );
      (prismaService.promotionList.update as jest.Mock).mockResolvedValue(
        updatedPromotionList,
      );
      (prismaService.$transaction as jest.Mock).mockResolvedValue(
        updatedPromotionList,
      );

      const result = await service.updatePromotionList(id, dto);

      expect(result).toEqual(updatedPromotionList);
      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { books: { select: { id: true, price: true } } },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw an error if promotion list not found', async () => {
      const id = 999;
      const dto: UpdatePromotionListDto = {
        name: 'Updated Promotion List',
        discountPercentage: 20,
      };

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.updatePromotionList(id, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { books: { select: { id: true, price: true } } },
      });
    });
  });

  describe('deletePromotionList', () => {
    it('should delete promotion list successfully', async () => {
      const id = 1;
      const mockPromotionList = { id, name: 'Promotion List 1' };

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        mockPromotionList,
      );
      (prismaService.promotionList.delete as jest.Mock).mockResolvedValue(
        mockPromotionList,
      );
      (prismaService.book.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.$transaction as jest.Mock).mockResolvedValue([
        mockPromotionList,
      ]);

      const result = await service.deletePromotionList(id);

      expect(result).toEqual({
        message: 'Deleted promotion list successfully',
      });
      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prismaService.promotionList.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw an error if promotion list not found', async () => {
      const id = 999;

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.deletePromotionList(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prismaService.promotionList.delete).not.toHaveBeenCalled();
    });
  });

  describe('addBooksToPromoList', () => {
    it('should add books to promotion list successfully', async () => {
      const promoId = 1;
      const dto: AddBooksToPromoListDto = { bookIds: [1, 2] };
      const mockPromotionList = { id: promoId, discountPercentage: 20 };
      const mockBooks = [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ];

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        mockPromotionList,
      );
      (prismaService.book.findMany as jest.Mock).mockResolvedValue(mockBooks);
      (prismaService.$transaction as jest.Mock).mockResolvedValue(mockBooks);

      const result = await service.addBooksToPromoList(promoId, dto);

      expect(result).toEqual({
        message: 'Added books to promotion list successfully',
      });
      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id: promoId },
      });
      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        where: { id: { in: dto.bookIds } },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw an error if promotion list not found', async () => {
      const promoId = 999;
      const dto: AddBooksToPromoListDto = { bookIds: [1, 2] };

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.addBooksToPromoList(promoId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id: promoId },
      });
      expect(prismaService.book.findMany).not.toHaveBeenCalled();
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('removeBookFromPromoList', () => {
    it('should remove book from promotion list successfully', async () => {
      const promoId = 1;
      const bookId = 1;
      const mockPromotionList = { id: promoId, name: 'Promotion List 1' };
      const mockBook = { id: bookId, promotionListId: promoId, price: 100 };

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        mockPromotionList,
      );
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.book.update as jest.Mock).mockResolvedValue(mockBook);

      const result = await service.removeBookFromPromoList(promoId, bookId);

      expect(result).toEqual({
        message: 'Removed book from promotion list successfully',
      });
      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id: promoId },
      });
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId },
      });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: {
          promotionListId: null,
          finalPrice: mockBook.price,
          discountPercentage: 0,
          discountDate: null,
        },
      });
    });

    it('should throw an error if promotion list not found', async () => {
      const promoId = 999;
      const bookId = 1;

      (prismaService.promotionList.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.removeBookFromPromoList(promoId, bookId),
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.promotionList.findUnique).toHaveBeenCalledWith({
        where: { id: promoId },
      });
      expect(prismaService.book.findUnique).not.toHaveBeenCalled();
      expect(prismaService.book.update).not.toHaveBeenCalled();
    });
  });
});
