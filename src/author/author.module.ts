import { Module } from '@nestjs/common';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';

@Module({
  providers: [AuthorService],
  controllers: [AuthorController],
})
export class AuthorModule {}
