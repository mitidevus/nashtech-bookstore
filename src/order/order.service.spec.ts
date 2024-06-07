import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderPageOptionsDto, UpdateOrderStatusDto } from './dto';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            book: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            orderItem: {
              createMany: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      const mockUserId = 'user1';
      const mockDto = {
        fullName: 'John Doe',
        phone: '123456789',
        shippingAddress: '123 Street, City',
        paymentMethod: PaymentMethod.cod,
        items: [
          { bookId: 1, quantity: 2 },
          { bookId: 2, quantity: 1 },
        ],
      };

      const mockBooks = [
        { id: 1, price: 10, finalPrice: 9 },
        { id: 2, price: 20, finalPrice: 18 },
      ];

      (prismaService.book.findMany as jest.Mock).mockResolvedValue(mockBooks);
      (prismaService.$transaction as jest.Mock).mockImplementation((fn) =>
        fn(prismaService),
      );
      (prismaService.order.create as jest.Mock).mockResolvedValue({
        id: 'order1',
      });
      (prismaService.orderItem.createMany as jest.Mock).mockImplementation(
        (args) => args.data,
      );

      (prismaService.order.update as jest.Mock).mockResolvedValue({
        id: 'order1',
      });

      const result = await service.createOrder(mockUserId, mockDto);

      expect(result).toBeDefined();
      expect(result.id).toEqual('order1');
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders with pagination', async () => {
      const mockUserId = 'user1';

      const mockDto: OrderPageOptionsDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      const mockOrders = [
        { id: 'order1', userId: mockUserId },
        { id: 'order2', userId: mockUserId },
      ];

      (prismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prismaService.order.count as jest.Mock).mockResolvedValue(
        mockOrders.length,
      );

      const result = await service.getUserOrders(mockUserId, mockDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockOrders);
      expect(result.totalPages).toEqual(1);
      expect(result.totalCount).toEqual(2);
    });

    it('should return user orders without pagination', async () => {
      const mockUserId = 'user1';

      const mockDto: OrderPageOptionsDto = {
        skip: undefined,
      };

      const mockOrders = [
        { id: 'order1', userId: mockUserId },
        { id: 'order2', userId: mockUserId },
      ];

      (prismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prismaService.order.count as jest.Mock).mockResolvedValue(
        mockOrders.length,
      );

      const result = await service.getUserOrders(mockUserId, mockDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockOrders);
      expect(result.totalPages).toEqual(1);
      expect(result.totalCount).toEqual(2);
    });

    it('should return user orders with empty data', async () => {
      const mockUserId = 'user1';

      const mockDto: OrderPageOptionsDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      (prismaService.order.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.order.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getUserOrders(mockUserId, mockDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.totalPages).toEqual(0);
      expect(result.totalCount).toEqual(0);
    });
  });

  describe('getOrders', () => {
    it('should return orders with pagination', async () => {
      const mockDto: OrderPageOptionsDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      const mockOrders = [{ id: 'order1' }, { id: 'order2' }];

      (prismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prismaService.order.count as jest.Mock).mockResolvedValue(
        mockOrders.length,
      );

      const result = await service.getOrders(mockDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockOrders);
      expect(result.totalPages).toEqual(1);
      expect(result.totalCount).toEqual(2);
    });

    it('should return orders without pagination', async () => {
      const mockDto: OrderPageOptionsDto = {
        skip: undefined,
      };

      const mockOrders = [{ id: 'order1' }, { id: 'order2' }];

      (prismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prismaService.order.count as jest.Mock).mockResolvedValue(
        mockOrders.length,
      );

      const result = await service.getOrders(mockDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockOrders);
      expect(result.totalPages).toEqual(1);
      expect(result.totalCount).toEqual(2);
    });

    it('should return orders with empty data', async () => {
      const mockDto: OrderPageOptionsDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      (prismaService.order.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.order.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getOrders(mockDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.totalPages).toEqual(0);
      expect(result.totalCount).toEqual(0);
    });
  });

  describe('getUserOrderById', () => {
    it('should return user order by id', async () => {
      const mockUserId = 'user1';
      const mockOrderId = 'order1';

      const mockOrder = { id: mockOrderId, userId: mockUserId };

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await service.getUserOrderById(mockUserId, mockOrderId);

      expect(result).toBeDefined();
      expect(result.id).toEqual(mockOrderId);
    });

    it('should throw error if order not found', async () => {
      const mockUserId = 'user1';
      const mockOrderId = 'order1';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getUserOrderById(mockUserId, mockOrderId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if order not belong to user', async () => {
      const mockUserId = 'user1';
      const mockOrderId = 'order1';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
        userId: 'user2',
      });

      await expect(
        service.getUserOrderById(mockUserId, mockOrderId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrderId = 'order1';

      const mockOrder = { id: mockOrderId };

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await service.getOrderById(mockOrderId);

      expect(result).toBeDefined();
      expect(result.id).toEqual(mockOrderId);
    });

    it('should throw error if order not found', async () => {
      const mockOrderId = 'order1';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrderById(mockOrderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrderId = 'order1';
      const mockDto: UpdateOrderStatusDto = {
        status: OrderStatus.completed,
      };

      // Mock PrismaService methods
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
        status: OrderStatus.pending, // Mock initial status
      });
      (prismaService.$transaction as jest.Mock).mockImplementation((fn) =>
        fn(prismaService),
      );
      (prismaService.order.update as jest.Mock).mockImplementation(
        async ({ where, data }) => ({
          ...where, // Mock returning updated order with status change
          ...data,
        }),
      );
      (prismaService.orderItem.findMany as jest.Mock).mockResolvedValue([
        { bookId: 1, quantity: 2 }, // Mock order items if needed
      ]);
      (prismaService.book.update as jest.Mock).mockResolvedValue({ id: 1 });

      // Call the method
      const result = await service.updateOrderStatus(mockOrderId, mockDto);

      // Assertions
      expect(result).toBeDefined();
      expect(result.status).toEqual(OrderStatus.completed);
    });

    it('should throw error if order not found', async () => {
      const mockOrderId = 'order1';
      const mockStatus = 'completed';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateOrderStatus(mockOrderId, { status: mockStatus }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const mockOrderId = 'order1';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });

      (prismaService.order.delete as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });

      const result = await service.deleteOrder(mockOrderId);

      expect(result).toBeDefined();
      expect(result.message).toEqual('Deleted order successfully');
    });

    it('should throw error if order not found', async () => {
      const mockOrderId = 'order1';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteOrder(mockOrderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if failed to delete order', async () => {
      const mockOrderId = 'order1';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });

      (prismaService.order.delete as jest.Mock).mockRejectedValue(new Error());

      await expect(service.deleteOrder(mockOrderId)).rejects.toThrow();
    });
  });
});
