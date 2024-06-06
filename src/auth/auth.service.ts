import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { DEFAULT_IMAGE_URL } from 'src/constants/app';
import { TokenType } from 'src/constants/auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginRequestDto, SignUpRequestDto } from './dto';
import { ITokenPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpRequestDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    const hash = await argon.hash(dto.password);

    try {
      const newUser = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
          image: DEFAULT_IMAGE_URL,
        },
      });

      const tokens = await this.signTokens({
        sub: newUser.id,
        email: newUser.email,
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          address: newUser.address,
          phone: newUser.phone,
          image: newUser.image,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Error creating user');
    }
  }

  async login(dto: LoginRequestDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const passwordMatch = await argon.verify(user.password, dto.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        phone: user.phone,
        image: user.image,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateJwtToken(
    tokenType: TokenType,
    sub: string,
    email: string,
  ): Promise<string> {
    let secret: string;
    let expiresIn: string;

    switch (tokenType) {
      case TokenType.ACCESS:
        secret = this.configService.get('JWT_AT_SECRET');
        expiresIn = this.configService.get('JWT_AT_EXPIRES');
        break;
      case TokenType.REFRESH:
        secret = this.configService.get('JWT_RT_SECRET');
        expiresIn = this.configService.get('JWT_RT_EXPIRES');
        break;
      case TokenType.VERIFICATION:
        secret = this.configService.get('JWT_VT_SECRET');
        expiresIn = this.configService.get('JWT_VT_EXPIRES');
        break;
      default:
        throw new Error('Invalid token type');
    }

    const payload: ITokenPayload = { sub, email };
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return token;
  }

  private async signTokens(payload: ITokenPayload) {
    const accessToken = await this.generateJwtToken(
      TokenType.ACCESS,
      payload.sub,
      payload.email,
    );

    const refreshToken = await this.generateJwtToken(
      TokenType.REFRESH,
      payload.sub,
      payload.email,
    );

    const hash = await argon.hash(refreshToken);

    await this.prismaService.user.update({
      where: {
        id: payload.sub,
      },
      data: {
        refreshToken: hash,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      address: user.address,
      phone: user.phone,
      image: user.image,
    };
  }
}
