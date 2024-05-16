import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorModule } from './author/author.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthorModule,
  ],
})
export class AppModule {}
