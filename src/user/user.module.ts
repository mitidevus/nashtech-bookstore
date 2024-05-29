import { Module } from '@nestjs/common';
import { UserViewController } from './user-view-controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController, UserViewController],
  providers: [UserService],
})
export class UserModule {}
