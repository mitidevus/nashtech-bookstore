import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorPageOptionsDto, CreateAuthorDto } from './dto';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAuthor(dto: CreateAuthorDto) {
    try {
      const author = await this.prismaService.author.create({
        data: {
          name: dto.name,
        },
      });

      return author;
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        message: 'Failed to create author',
      });
    }
  }

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
