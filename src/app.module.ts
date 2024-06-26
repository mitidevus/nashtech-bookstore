import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromotionListModule } from './promotion-list/promotion-list.module';
import { RatingReviewModule } from './rating-review/rating-review.module';
import { RedisModule } from './services/redis/redis.module';
import { UserModule } from './user/user.module';
import { AboutModule } from './about/about.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: false,
    }),
    AuthorModule,
    AuthModule,
    BookModule,
    CategoryModule,
    PromotionListModule,
    RatingReviewModule,
    OrderModule,
    UserModule,
    CartModule,
    RedisModule,
    AboutModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
