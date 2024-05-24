import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_IMAGE_URL } from 'constants/app';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorPageOptionsDto, CreateAuthorDto, UpdateAuthorDto } from './dto';

@Injectable()
export class AuthorService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAuthor(dto: CreateAuthorDto) {
    try {
      const author = await this.prismaService.author.create({
        data: {
          name: dto.name,
          image: dto.image || DEFAULT_IMAGE_URL,
          slug: slugify(dto.name, {
            lower: true,
          }),
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
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async updateAuthor(id: number, dto: UpdateAuthorDto) {
    if (!Object.keys(dto).length) {
      throw new BadRequestException({
        message: 'No data provided',
      });
    }

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

    const authorExists = await this.prismaService.author.findFirst({
      where: {
        name: dto.name,
      },
    });

    if (authorExists) {
      throw new BadRequestException({
        message: 'Author already exists',
      });
    }

    try {
      const updatedAuthor = await this.prismaService.author.update({
        where: {
          id,
        },
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
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
