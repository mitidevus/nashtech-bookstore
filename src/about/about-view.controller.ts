import {
  Body,
  Controller,
  Get,
  Patch,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { AboutService } from './about.service';

@Controller('/about')
@UseFilters(AuthExceptionFilter)
export class AboutViewController {
  constructor(private readonly aboutService: AboutService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('edit')
  @Render('about/edit')
  async editPage() {
    const about = await this.aboutService.getContent();
    return { content: about?.content || 'No content available.' };
  }

  @UseGuards(AuthenticatedGuard)
  @Patch()
  async saveContent(@Body('content') content: string) {
    await this.aboutService.saveContent(content);
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('about/preview')
  async getContent() {
    const about = await this.aboutService.getContent();
    return { content: about?.content || 'No content available.' };
  }
}
