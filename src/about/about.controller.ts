import { Controller, Get } from '@nestjs/common';
import { AboutService } from './about.service';

@Controller('/api/about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  async getContent() {
    const about = await this.aboutService.getContent();
    return { content: about?.content || 'No content available.' };
  }
}
