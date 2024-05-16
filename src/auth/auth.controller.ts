import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, SignUpRequestDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpRequestDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async basicLogin(@Body() dto: LoginRequestDto) {
    return await this.authService.login(dto);
  }
}
