import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUsersService',
      useClass: UsersService,
    },
  ],
})
export class UserModule {}
