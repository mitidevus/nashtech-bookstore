import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { Order } from 'src/constants/app';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPageOptionsDto } from './dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const dto: UserPageOptionsDto = {
        page: 1,
        take: 10,
        order: Order.ASC,
        skip: 0,
        role: UserRole.user,
      };

      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      const totalCount = mockUsers.length;

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prismaService.user.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.getUsers(dto);

      expect(result).toEqual({
        data: mockUsers,
        totalPages: 1,
        totalCount,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
        skip: dto.skip,
        take: dto.take,
      });
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should return users without pagination', async () => {
      const dto: UserPageOptionsDto = {
        order: Order.ASC,
        role: UserRole.user,
        skip: undefined,
      };

      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      const totalCount = mockUsers.length;

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prismaService.user.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.getUsers(dto);

      expect(result).toEqual({
        data: mockUsers,
        totalPages: 1,
        totalCount,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
      });
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should return an empty array if there are no users', async () => {
      const dto: UserPageOptionsDto = {
        page: 1,
        take: 10,
        order: Order.ASC,
        skip: 0,
        role: UserRole.user,
      };

      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getUsers(dto);

      expect(result).toEqual({
        data: [],
        totalPages: 0,
        totalCount: 0,
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
        skip: dto.skip,
        take: dto.take,
      });

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
      });
    });

    it('should handle invalid skip and take values gracefully', async () => {
      const dto: UserPageOptionsDto = {
        page: -1,
        take: 0,
        order: Order.ASC,
        skip: -1,
        role: UserRole.user,
      };

      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      const totalCount = mockUsers.length;

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prismaService.user.count as jest.Mock).mockResolvedValue(totalCount);

      const result = await service.getUsers(dto);

      expect(result).toEqual({
        data: mockUsers,
        totalPages: 1,
        totalCount,
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
      });

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { role: dto.role },
        orderBy: [{ createdAt: dto.order }],
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const id = '1';
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        orders: [],
        ratingReviews: [],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(id);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          orders: true,
          ratingReviews: {
            include: { book: true },
          },
        },
      });
    });

    it('should throw en error if user not found', async () => {
      const id = '1';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserById(id)).rejects.toThrow(NotFoundException);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          orders: true,
          ratingReviews: {
            include: { book: true },
          },
        },
      });
    });

    it('should throw an error if user ID is invalid', async () => {
      const id = 'invalid-id';

      await expect(service.getUserById(id)).rejects.toThrow();

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          orders: true,
          ratingReviews: {
            include: { book: true },
          },
        },
      });
    });

    it('should return user with full related information', async () => {
      const id = '1';
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        orders: [{ id: '1', total: 100 }],
        ratingReviews: [
          {
            id: '1',
            rating: 5,
            review: 'Great book!',
            book: { id: '1', name: 'Book 1' },
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(id);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          orders: true,
          ratingReviews: {
            include: { book: true },
          },
        },
      });
    });
  });
});
