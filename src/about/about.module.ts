import { Module } from '@nestjs/common';
import { AboutViewController } from './about-view.controller';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';

@Module({
  providers: [AboutService],
  controllers: [AboutController, AboutViewController],
})
export class AboutModule {}
