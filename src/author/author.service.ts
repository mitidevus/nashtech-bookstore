import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorPageOptionsDto, CreateAuthorDto, UpdateAuthorDto } from './dto';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAuthor(dto: CreateAuthorDto) {
    try {
      const author = await this.prismaService.author.create({
        data: {
          ...dto,
        },
      });

      return author;
    } catch (error) {
      console.log('Error:', error.message);
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

  async updateAuthor(id: number, dto: UpdateAuthorDto) {
    const author = await this.prismaService.author.findUnique({
      where: {
        id,
      },
    });

    if (!author) {
      throw new NotFoundException({
        message: 'Author not found',
      });
    }

    try {
      const updatedAuthor = await this.prismaService.author.update({
        where: {
          id,
        },
        data: {
          name: dto.name,
        },
      });

      return updatedAuthor;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update author',
      });
    }
  }

  async deleteAuthor(id: number) {
    const author = await this.prismaService.author.findUnique({
      where: {
        id,
      },
    });

    if (!author) {
      throw new NotFoundException({
        message: 'Author not found',
      });
    }

    try {
      await this.prismaService.author.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Deleted author successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to delete author',
      });
    }
  }
}
