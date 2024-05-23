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
  Render,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DEFAULT_AUTHOR_PAGE_SIZE } from 'constants/author';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { AuthorService } from './author.service';
import { AuthorPageOptionsDto, CreateAuthorDto, UpdateAuthorDto } from './dto';

@Controller()
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post('/api/authors')
  createAuthor(@Body() dto: CreateAuthorDto) {
    return this.authorService.createAuthor(dto);
  }

  @Get('/api/authors')
  getAuthors(@Query() dto: AuthorPageOptionsDto) {
    return this.authorService.getAuthors(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch('/api/authors/:id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return await this.authorService.updateAuthor(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete('/api/authors/:id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.deleteAuthor(id);
  }

  @Get('/authors')
  @Render('authors/index')
  async renderAuthors(@Query() dto: AuthorPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_AUTHOR_PAGE_SIZE;

    const result = await this.authorService.getAuthors(dto);

    return {
      ...result,
      currentPage: dto.page,
    };
  }
}
