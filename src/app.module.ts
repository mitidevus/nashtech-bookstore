import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AuthorModule } from './author/author.module';
import { AuthorService } from './author/author.service';
import { BookModule } from './book/book.module';
import { BookService } from './book/book.service';
import { CategoryModule } from './category/category.module';
import { CategoryService } from './category/category.service';
import { OrderModule } from './order/order.module';
import { OrderService } from './order/order.service';
import { PrismaModule } from './prisma/prisma.module';
import { PromotionListModule } from './promotion-list/promotion-list.module';
import { PromotionListService } from './promotion-list/promotion-list.service';
import { RatingReviewModule } from './rating-review/rating-review.module';
import { RatingReviewService } from './rating-review/rating-review.service';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [AppController],
  providers: [
    AuthorService,
    CategoryService,
    PromotionListService,
    OrderService,
    RatingReviewService,
    UserService,
    BookService,
  ],
})
export class AppModule {}
