import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { AuthorService } from './author.service';
import { AuthorPageOptionsDto } from './dto';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  getAuthors(@Query() dto: AuthorPageOptionsDto) {
    return this.authorService.getAuthors(dto);
  }
}
