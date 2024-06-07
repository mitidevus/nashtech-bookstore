import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAppError } from 'firebase-admin/app';
import slugify from 'slugify';
import { DEFAULT_IMAGE_URL, Order } from 'src/constants/app';
import { PrismaService } from 'src/prisma/prisma.service';
import { uploadFilesFromFirebase } from 'src/services/files/upload';
import { AuthorService } from './author.service';
import {
  AddBooksToAuthorDto,
  AuthorPageOptionsDto,
  CreateAuthorDto,
  UpdateAuthorDto,
} from './dto';

jest.mock('src/services/files/upload');

describe('AuthorService', () => {
  let service: AuthorService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: PrismaService,
          useValue: {
            author: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            book: {
              findMany: jest.fn(),
            },
            bookAuthor: {
              findMany: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthorService>(AuthorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuthor', () => {
    it('should create an author successfully with image', async () => {
      const dto: CreateAuthorDto = { name: 'Test Author' };
      const image = { buffer: Buffer.from('test') } as Express.Multer.File;
      const imageUrls = ['http://example.com/image.jpg'];

      (uploadFilesFromFirebase as jest.Mock).mockResolvedValue({
        success: true,
        urls: imageUrls,
      });

      const expectedAuthor = {
        id: 1,
        name: 'Test Author',
        image: imageUrls[0],
        slug: slugify(dto.name, { lower: true, locale: 'vi' }),
      };

      (prismaService.author.create as jest.Mock).mockResolvedValue(
        expectedAuthor,
      );

      const result = await service.createAuthor(dto, image);

      expect(result).toEqual(expectedAuthor);
      expect(prismaService.author.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          image: imageUrls[0],
          slug: slugify(dto.name, { lower: true, locale: 'vi' }),
        },
      });
    });

    it('should create an author successfully without image', async () => {
      const dto: CreateAuthorDto = { name: 'Test Author' };

      const expectedAuthor = {
        id: 1,
        name: 'Test Author',
        image: DEFAULT_IMAGE_URL,
        slug: slugify(dto.name, { lower: true, locale: 'vi' }),
      };

      (prismaService.author.create as jest.Mock).mockResolvedValue(
        expectedAuthor,
      );

      const result = await service.createAuthor(dto);

      expect(result).toEqual(expectedAuthor);
      expect(prismaService.author.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          image: DEFAULT_IMAGE_URL,
          slug: slugify(dto.name, { lower: true, locale: 'vi' }),
        },
      });
    });

    it('should throw BadRequestException if image upload fails', async () => {
      const id = 1;
      const dto: UpdateAuthorDto = { name: 'Updated Test Author' };
      const image = { buffer: Buffer.from('test') } as Express.Multer.File;

      const author = {
        id: 1,
        name: 'Existing Author',
        image: 'existing_image_url',
      };
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(author);

      (uploadFilesFromFirebase as jest.Mock).mockRejectedValue(
        new Error('Failed to upload images!'),
      );

      await expect(service.updateAuthor(id, dto, image)).rejects.toThrow(
        FirebaseAppError,
      );

      expect(prismaService.author.update).not.toHaveBeenCalled();
    });
  });

  describe('getAuthors', () => {
    it('should return a list of authors with pagination', async () => {
      const dto: AuthorPageOptionsDto = {
        page: 1,
        take: 10,
        order: Order.ASC,
        skip: 0,
      };
      const mockAuthors = [
        { id: 1, name: 'Author 1' },
        { id: 2, name: 'Author 2' },
      ];
      const totalCount = 2;

      (prismaService.author.findMany as jest.Mock).mockResolvedValue(
        mockAuthors,
      );
      (prismaService.author.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.getAuthors(dto);

      expect(result.data).toEqual(mockAuthors);
      expect(result.totalPages).toEqual(1);
      expect(result.totalCount).toEqual(totalCount);
    });

    it('should return an empty list if no authors found', async () => {
      const dto: AuthorPageOptionsDto = {
        page: 1,
        take: 2,
        order: Order.ASC,
        skip: 0,
      };

      (prismaService.author.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.author.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getAuthors(dto);

      expect(result).toEqual({
        data: [],
        totalPages: 0,
        totalCount: 0,
      });
    });
  });

  describe('getAuthorById', () => {
    it('should return an author if found', async () => {
      const id = 1;
      const mockAuthor = {
        id: 1,
        name: 'Author 1',
        books: [],
      };

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        mockAuthor,
      );

      const result = await service.getAuthorById(id);

      expect(result).toEqual({
        ...mockAuthor,
        books: mockAuthor.books.map((item) => ({
          ...item.book,
          addedAt: item.createdAt,
        })),
      });
      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          books: {
            select: {
              book: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 1;

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getAuthorById(id)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          books: {
            select: {
              book: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    });
  });

  describe('updateAuthor', () => {
    it('should update an author successfully', async () => {
      const id = 1;
      const dto: UpdateAuthorDto = { name: 'Updated Author' };
      const image = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockAuthor = {
        id: 1,
        name: 'Author 1',
        image: 'http://example.com/image.jpg',
      };
      const updatedAuthor = { ...mockAuthor, ...dto };

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        mockAuthor,
      );
      (uploadFilesFromFirebase as jest.Mock).mockResolvedValue({
        success: true,
        urls: ['http://example.com/image.jpg'],
      });
      (prismaService.author.update as jest.Mock).mockResolvedValue(
        updatedAuthor,
      );

      const result = await service.updateAuthor(id, dto, image);

      expect(result).toEqual(updatedAuthor);
      expect(prismaService.author.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          ...dto,
          slug: slugify(dto.name, { lower: true, locale: 'vi' }),
          image: 'http://example.com/image.jpg',
        },
      });
    });

    it('should throw BadRequestException if no data provided', async () => {
      const id = 1;
      const dto: UpdateAuthorDto = {};

      await expect(service.updateAuthor(id, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.author.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 1;
      const dto: UpdateAuthorDto = { name: 'Updated Author' };

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateAuthor(id, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prismaService.author.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteAuthor', () => {
    it('should delete an author successfully', async () => {
      const id = 1;
      const mockAuthor = { id: 1, name: 'Author 1' };

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        mockAuthor,
      );

      const result = await service.deleteAuthor(id);

      expect(result).toEqual({ message: 'Deleted author successfully' });
      expect(prismaService.author.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 1;

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteAuthor(id)).rejects.toThrow(NotFoundException);

      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prismaService.author.delete).not.toHaveBeenCalled();
    });
  });

  describe('addBooksToAuthor', () => {
    it('should add books to author successfully', async () => {
      const id = 1;
      const dto: AddBooksToAuthorDto = { bookIds: [1, 2] };
      const mockAuthor = { id: 1, name: 'Author 1' };
      const mockBooks = [
        { id: 1, name: 'Book 1' },
        { id: 2, name: 'Book 2' },
      ];

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        mockAuthor,
      );
      (prismaService.book.findMany as jest.Mock).mockResolvedValue(mockBooks);
      (prismaService.bookAuthor.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.addBooksToAuthor(id, dto);

      expect(result).toEqual({ message: 'Added books to author successfully' });
      expect(prismaService.bookAuthor.createMany).toHaveBeenCalledWith({
        data: dto.bookIds.map((bookId) => ({
          bookId,
          authorId: id,
        })),
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 1;
      const dto: AddBooksToAuthorDto = { bookIds: [1, 2] };

      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addBooksToAuthor(id, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prismaService.bookAuthor.createMany).not.toHaveBeenCalled();
    });
  });
});
