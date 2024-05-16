import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { AuthorService } from './author.service';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(JwtGuard)
  @Get()
  getAuthors() {
    return this.authorService.getAuthors();
  }
}
