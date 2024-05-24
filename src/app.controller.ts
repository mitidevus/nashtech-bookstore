import {
  Controller,
  Get,
  Post,
  Query,
  Render,
  Request,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DateFormat } from 'constants/app';
import { DEFAULT_AUTHOR_PAGE_SIZE } from 'constants/author';
import { Response } from 'express';
import { AuthExceptionFilter } from './auth/filters';
import {
  AuthenticatedGuard,
  LoginGuard,
  UnauthenticatedGuard,
} from './auth/guard';
import { AuthorService } from './author/author.service';
import { AuthorPageOptionsDto } from './author/dto';
import { formatDate } from './utils';

@Controller()
@UseFilters(AuthExceptionFilter)
export class AppController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(UnauthenticatedGuard)
  @Get('/login')
  @Render('login')
  index(@Request() req): { message: string } {
    return { message: req.flash('loginError') };
  }

  @UseGuards(LoginGuard)
  @Post('/login')
  login(@Res() res: Response): void {
    res.redirect('/');
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('index')
  root(@Request() req) {
    return { user: req.user };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/authors')
  @Render('authors/list')
  async getAuthorListPage(@Query() dto: AuthorPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_AUTHOR_PAGE_SIZE;

    const res = await this.authorService.getAuthors(dto);

    const result = {
      ...res,
      data: res.data.map((author) => {
        return {
          ...author,
          createdAt: formatDate({
            date: author.createdAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
          updatedAt: formatDate({
            date: author.updatedAt,
            targetFormat: DateFormat.TIME_DATE,
          }),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @Get('/logout')
  logout(@Request() req, @Res() res: Response): void {
    req.logout();
    res.redirect('/login');
  }
}
