import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_TYPES_REGEX } from 'src/constants/image';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { EditProfileDto, LoginRequestDto, SignUpRequestDto } from './dto';
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

  @Patch('me')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  async editProfile(
    @GetUser('sub') userId: string,
    @Body() dto: EditProfileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ) {
    return await this.authService.editProfile(userId, dto, image);
  }
}
