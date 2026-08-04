import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CryptoModule } from '../../common/crypto/crypto.module';
import { UsersRepository } from './repositories/users.repository';
import { DrizzleUsersRepository } from './repositories/drizzle-users.repository';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: DrizzleUsersRepository,
    },
  ],
  imports: [CryptoModule, RolesModule],
})
export class UsersModule {}
