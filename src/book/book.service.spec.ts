import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_BOOK_IMAGE_URL } from 'src/constants/app';
import { EUploadFolder } from 'src/constants/image';
import { PrismaService } from 'src/prisma/prisma.service';
import { uploadFilesFromFirebase } from 'src/services/files/upload';
import { BookService } from './book.service';
import { CreateBookInput } from './dto';

jest.mock('src/services/files/upload');

describe('BookService', () => {
  let service: BookService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
    },
    author: {
      findMany: jest.fn(),
    },
    book: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    bookCategory: {
      createMany: jest.fn(),
    },
    bookAuthor: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    const mockDto: CreateBookInput = {
      name: 'Test Book',
      description: 'Test Description',
      price: '100',
      categoryIds: '1,2,3',
      authorIds: '1,2',
    };

    const image = { buffer: Buffer.from('test') } as Express.Multer.File;
    const imageUrls = ['http://example.com/image.jpg'];

    it('should create a book with valid data and image upload', async () => {
      (uploadFilesFromFirebase as jest.Mock).mockResolvedValue({
        success: true,
        urls: imageUrls,
      });

      mockPrismaService.category.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      mockPrismaService.author.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        callback({
          book: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Test Book',
              description: 'Test Description',
              image: imageUrls[0],
              price: 100,
              finalPrice: 100,
            }),
            update: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Test Book',
              description: 'Test Description',
              image: imageUrls[0],
              price: 100,
              finalPrice: 100,
              slug: 'test-book_1',
              authors: [],
              categories: [],
            }),
          },
          bookCategory: { createMany: jest.fn() },
          bookAuthor: { createMany: jest.fn() },
        }),
      );

      const result = await service.createBook(mockDto, image);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Book');
      expect(result.image).toBe(imageUrls[0]);
      expect(uploadFilesFromFirebase).toHaveBeenCalledWith(
        [image],
        EUploadFolder.book,
      );
    });

    it('should create a book with valid data and default image', async () => {
      (uploadFilesFromFirebase as jest.Mock).mockResolvedValue({
        success: false,
        urls: [],
      });

      mockPrismaService.category.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      mockPrismaService.author.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        callback({
          book: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Test Book',
              description: 'Test Description',
              image: DEFAULT_BOOK_IMAGE_URL,
              price: 100,
              finalPrice: 100,
            }),
            update: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Test Book',
              description: 'Test Description',
              image: DEFAULT_BOOK_IMAGE_URL,
              price: 100,
              finalPrice: 100,
              slug: 'test-book_1',
              authors: [],
              categories: [],
            }),
          },
          bookCategory: { createMany: jest.fn() },
          bookAuthor: { createMany: jest.fn() },
        }),
      );

      const result = await service.createBook(mockDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Book');
      expect(result.image).toBe(DEFAULT_BOOK_IMAGE_URL);
      expect(uploadFilesFromFirebase).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException for invalid categories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([{ id: 1 }]);

      await expect(service.createBook(mockDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.category.findMany).toHaveBeenCalled();
    });

    it('should throw a BadRequestException for invalid authors', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      mockPrismaService.author.findMany.mockResolvedValue([{ id: 1 }]);

      await expect(service.createBook(mockDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.author.findMany).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if price is not a number', async () => {
      const invalidDto = { ...mockDto, price: 'invalid price' };

      await expect(service.createBook(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
