import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './repositories/permissions.repository';
import { DrizzlePermissionsRepository } from './repositories/drizzle-permissions.repository';

@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    {
      provide: PermissionsRepository,
      useClass: DrizzlePermissionsRepository,
    },
  ],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
