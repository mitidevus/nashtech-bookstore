import { Module } from '@nestjs/common';
import { AuthorViewController } from './author-view.controller';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';

@Module({
  providers: [AuthorService],
  controllers: [AuthorController, AuthorViewController],
})
export class AuthorModule {}
