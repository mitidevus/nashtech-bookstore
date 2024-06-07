import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon from 'argon2';
import { DEFAULT_IMAGE_URL } from 'src/constants/app';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginRequestDto, SignUpRequestDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    // Mock argon.hash and argon.verify
    (argon.hash as jest.Mock) = jest.fn().mockResolvedValue('hashed_password');
    (argon.verify as jest.Mock) = jest.fn().mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully create a new user and return tokens', async () => {
      const signUpDto: SignUpRequestDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      const newUser = {
        id: 1,
        email: signUpDto.email,
        password: 'hashed_password',
        name: signUpDto.name,
        role: 'user',
        address: null,
        phone: null,
        image: DEFAULT_IMAGE_URL,
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue(newUser);
      (service as any).signTokens = jest.fn().mockResolvedValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      const result = await service.signUp(signUpDto);

      expect(result.user.email).toBe(newUser.email);
      expect(result.accessToken).toBe('access_token');
      expect(result.refreshToken).toBe('refresh_token');
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          password: 'hashed_password',
          name: signUpDto.name,
          image: DEFAULT_IMAGE_URL,
        },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const signUpDto: SignUpRequestDto = {
        email: 'existing@example.com',
        password: 'password',
        name: 'Existing User',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: signUpDto.email,
        password: 'hashed_password',
        name: signUpDto.name,
        role: 'user',
        address: null,
        phone: null,
        image: DEFAULT_IMAGE_URL,
      });

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if error occurs during user creation', async () => {
      const signUpDto: SignUpRequestDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (argon.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'SOME_UNIQUE_CODE',
        message: 'Some error message',
      });

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login and return tokens', async () => {
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
        name: 'Test User',
        role: 'user',
        address: null,
        phone: null,
        image: DEFAULT_IMAGE_URL,
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (argon.verify as jest.Mock).mockResolvedValue(true);
      (service as any).signTokens = jest.fn().mockResolvedValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(user.email);
      expect(result.accessToken).toBe('access_token');
      expect(result.refreshToken).toBe('refresh_token');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto: LoginRequestDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
        name: 'Test User',
        role: 'user',
        address: null,
        phone: null,
        image: DEFAULT_IMAGE_URL,
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
