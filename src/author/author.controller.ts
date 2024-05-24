import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

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
  createAuthor(@Body() dto: CreateAuthorDto) {
    return this.authorService.createAuthor(dto);
  }

  @Get()
  getAuthors(@Query() dto: AuthorPageOptionsDto) {
    return this.authorService.getAuthors(dto);
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
