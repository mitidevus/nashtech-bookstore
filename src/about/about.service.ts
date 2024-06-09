import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  async saveContent(content: string) {
    const about = await this.prisma.about.findFirst();

    try {
      if (about) {
        await this.prisma.about.update({
          where: { id: about.id },
          data: { content },
        });
      } else {
        await this.prisma.about.create({ data: { content } });
      }
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to save content',
      });
    }
  }

  async getContent() {
    return await this.prisma.about.findFirst();
  }
}
