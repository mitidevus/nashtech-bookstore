import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorPageOptionsDto } from './dto';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAuthors(dto: AuthorPageOptionsDto) {
    const conditions = {
      orderBy: [
        {
          createdAt: dto.order,
        },
      ],
    };

    const pageOption =
      dto.page && dto.take
        ? {
            skip: dto.skip,
            take: dto.take,
          }
        : undefined;

    const [authors, totalCount] = await Promise.all([
      this.prismaService.author.findMany({
        ...conditions,
        ...pageOption,
      }),
      this.prismaService.author.count({
        ...conditions,
      }),
    ]);

    return {
      data: authors,
      totalPages: Math.ceil(totalCount / dto.take),
      totalCount,
    };
  }
}
