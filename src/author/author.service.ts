import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAuthors() {
    return this.prismaService.author.findMany();
  }
}
