import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ITokenPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_AT_SECRET'),
      ignoreExpiration: true, // Use custom validation instead
    });
  }

  async validate(payload: ITokenPayload) {
    const { exp } = payload;

    // Check if the token is expired
    if (Date.now() >= exp * 1000) {
      throw new ForbiddenException('Token has expired');
    }

    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    return {
      ...payload,
      role: user.role,
    };
  }
}
