import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { LoginRequestDto, SignUpRequestDto } from './dto';
import { JwtGuard } from './guard';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpRequestDto) {
    return await this.authService.signUp(dto);
  }

  @Post('login')
  async basicLogin(@Body() dto: LoginRequestDto) {
    return await this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getPofile(@GetUser('sub') userId: string) {
    return await this.authService.getProfile(userId);
  }
}
