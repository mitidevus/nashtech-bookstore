import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import slugify from 'slugify';
import { MAX_ITEMS_PER_PAGE, Order } from 'src/constants/app';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryService } from './category.service';
import { CategoryPageOptionsDto } from './dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            book: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            bookCategory: {
              findMany: jest.fn(),
              createMany: jest.fn(),
              findFirst: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should throw an error if category already exists', async () => {
      (prismaService.category.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });

      await expect(
        service.createCategory({ name: 'Test Category' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new category', async () => {
      (prismaService.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.category.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
      });

      const result = await service.createCategory({ name: 'Test Category' });

      expect(result).toEqual({
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Category',
          slug: slugify('Test Category', { lower: true, locale: 'vi' }),
        },
      });
    });
  });

  describe('getCategories', () => {
    it('should return paginated categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];
      const mockCount = 2;
      (prismaService.category.findMany as jest.Mock).mockResolvedValue(
        mockCategories,
      );
      (prismaService.category.count as jest.Mock).mockResolvedValue(mockCount);

      const optionsDto = new CategoryPageOptionsDto();
      optionsDto.page = 1;
      optionsDto.take = 2;
      optionsDto.order = Order.DESC;

      const result = await service.getCategories(optionsDto);

      expect(result).toEqual({
        data: mockCategories,
        totalPages: 1,
        totalCount: mockCount,
      });
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 2,
      });
      expect(prismaService.category.count).toHaveBeenCalledWith({
        orderBy: [{ createdAt: 'desc' }],
      });
    });

    it('should throw an error when page number is invalid', async () => {
      const optionsDto = new CategoryPageOptionsDto();
      optionsDto.page = 0;

      try {
        await service.getCategories(optionsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(['page must not be less than 1']);
        expect(error.response).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: ['page must not be less than 1'],
        });
      }
    });

    it('should throw an error when items per page is invalid', async () => {
      const optionsDto = new CategoryPageOptionsDto();
      optionsDto.take = 0;

      try {
        await service.getCategories(optionsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(['take must not be less than 1']);
        expect(error.response).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: ['take must not be less than 1'],
        });
      }
    });

    it('should throw an error when items per page exceeds the maximum limit', async () => {
      const optionsDto = new CategoryPageOptionsDto();
      optionsDto.take = 101;

      try {
        await service.getCategories(optionsDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual([
          `take must not be greater than ${MAX_ITEMS_PER_PAGE}`,
        ]);
        expect(error.response).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: [`take must not be greater than ${MAX_ITEMS_PER_PAGE}`],
        });
      }
    });
  });

  describe('getCategoryById', () => {
    it('should throw an error if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getCategoryById(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the category with books', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        books: [
          {
            book: { id: 1, name: 'Test Book', image: 'test-image' },
            createdAt: new Date(),
          },
        ],
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      const result = await service.getCategoryById(1);

      expect(result).toEqual({
        id: 1,
        name: 'Test Category',
        books: [
          {
            id: 1,
            name: 'Test Book',
            image: 'test-image',
            addedAt: mockCategory.books[0].createdAt,
          },
        ],
      });
    });

    it('should throw an error when trying to get a category by invalid ID type', async () => {
      await expect(
        service.getCategoryById('invalid-id' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return the category without books', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        books: [],
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      const result = await service.getCategoryById(1);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should throw an error if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteCategory(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.category.delete as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });

      const result = await service.deleteCategory(1);

      expect(result).toEqual({ message: 'Deleted category successfully' });
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error when trying to delete a category by invalid ID type', async () => {
      await expect(service.deleteCategory('invalid-id' as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCategory', () => {
    it('should throw an error if no data provided', async () => {
      await expect(service.updateCategory(1, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateCategory(1, { name: 'New Category' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if category name already exists', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Old Category',
      });
      (prismaService.category.findFirst as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'New Category',
      });

      await expect(
        service.updateCategory(1, { name: 'New Category' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Old Category',
      });
      (prismaService.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.category.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'New Category',
        slug: 'new-category',
      });

      const result = await service.updateCategory(1, { name: 'New Category' });

      expect(result).toEqual({
        id: 1,
        name: 'New Category',
        slug: 'new-category',
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'New Category',
          slug: slugify('New Category', { lower: true, locale: 'vi' }),
        },
      });
    });

    it('should throw an error when trying to update a category by invalid ID type', async () => {
      await expect(
        service.updateCategory('invalid-id' as any, { name: 'New Category' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error when trying to update a category by invalid data', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateCategory(1, { name: 123 as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addBooksToCategory', () => {
    it('should throw an error if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addBooksToCategory(1, { bookIds: [1, 2] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when trying to add books with empty book IDs to a category', async () => {
      await expect(
        service.addBooksToCategory(1, { bookIds: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if some books are not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.book.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Test Book' },
      ]);

      await expect(
        service.addBooksToCategory(1, { bookIds: [1, 2] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if some books are already in the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.book.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Test Book' },
        { id: 2, name: 'Test Book 2' },
      ]);
      (prismaService.bookCategory.findMany as jest.Mock).mockResolvedValue([
        { bookId: 1, categoryId: 1 },
      ]);

      await expect(
        service.addBooksToCategory(1, { bookIds: [1, 2] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add books to the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.book.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Test Book' },
        { id: 2, name: 'Test Book 2' },
      ]);
      (prismaService.bookCategory.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.bookCategory.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await service.addBooksToCategory(1, { bookIds: [1, 2] });

      expect(result).toEqual({
        message: 'Added books to category successfully',
      });
      expect(prismaService.bookCategory.createMany).toHaveBeenCalledWith({
        data: [
          { bookId: 1, categoryId: 1 },
          { bookId: 2, categoryId: 1 },
        ],
      });
    });
  });

  describe('getBooksNotInCategory', () => {
    it('should throw an error if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getBooksNotInCategory(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return books not in the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.book.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Test Book' },
        { id: 2, name: 'Test Book 2' },
      ]);

      const result = await service.getBooksNotInCategory(1);

      expect(result).toEqual([
        { id: 1, name: 'Test Book' },
        { id: 2, name: 'Test Book 2' },
      ]);
    });

    it('should throw an error when trying to get books not in a category by invalid ID type', async () => {
      await expect(
        service.getBooksNotInCategory('invalid-id' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return an empty array when there are no books not in the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.book.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.bookCategory.findMany as jest.Mock).mockResolvedValue([
        { bookId: 1, categoryId: 1 },
        { bookId: 2, categoryId: 1 },
      ]);

      const result = await service.getBooksNotInCategory(1);

      expect(result).toEqual([]);
    });
  });

  describe('removeBookFromCategory', () => {
    it('should throw an error if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.removeBookFromCategory(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if book not found in the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.bookCategory.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.removeBookFromCategory(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should remove book from the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
      });
      (prismaService.bookCategory.findFirst as jest.Mock).mockResolvedValue({
        bookId: 1,
        categoryId: 1,
      });
      (prismaService.bookCategory.delete as jest.Mock).mockResolvedValue({
        bookId: 1,
        categoryId: 1,
      });

      const result = await service.removeBookFromCategory(1, 1);

      expect(result).toEqual({
        message: 'Removed book from category successfully',
      });
      expect(prismaService.bookCategory.delete).toHaveBeenCalledWith({
        where: {
          bookId_categoryId: { bookId: 1, categoryId: 1 },
        },
      });
    });

    it('should throw an error when trying to remove a book from a category by invalid ID type', async () => {
      await expect(
        service.removeBookFromCategory('invalid-id' as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when trying to remove a book from a category by invalid book ID type', async () => {
      await expect(
        service.removeBookFromCategory(1, 'invalid-id' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
