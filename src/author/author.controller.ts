import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_TYPES_REGEX } from 'constants/image';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { AuthorService } from './author.service';
import { AuthorPageOptionsDto, CreateAuthorDto, UpdateAuthorDto } from './dto';

@Controller('/api/authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createAuthor(
    @Body() dto: CreateAuthorDto,
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
    return this.authorService.createAuthor(dto, image);
  }

  @Get()
  getAuthors(@Query() dto: AuthorPageOptionsDto) {
    return this.authorService.getAuthors(dto);
  }

  @Get(':id')
  getAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.getAuthor(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return await this.authorService.updateAuthor(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.deleteAuthor(id);
  }
}
