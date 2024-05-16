import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorModule } from './author/author.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthorModule,
    AuthModule,
  ],
})
export class AppModule {}
