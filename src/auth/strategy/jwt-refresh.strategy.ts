import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ITokenPayload } from '../interfaces/ITokenPayload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: process.env.JWT_RT_SECRET,
      passReqToCallback: true,
      ignoreExpiration: true, // Use custom validation instead
    });
  }

  async validate(request: Request, payload: ITokenPayload) {
    const refreshToken = request.body.refreshToken;
    const { exp } = payload;

    if (!refreshToken || !payload) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    // Check if the token is expired
    if (Date.now() >= exp * 1000) {
      //  Set refresh token to null
      await this.prismaService.user.update({
        where: {
          id: payload.sub,
        },
        data: {
          refreshToken: null,
        },
      });

      throw new ForbiddenException('Token has expired');
    }

    return {
      refreshToken,
      ...payload,
    };
  }
}
