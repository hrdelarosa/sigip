import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepository } from './repositories/roles.repository';
import { DrizzleRolesRepository } from './repositories/drizzle-roles.repository';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: RolesRepository,
      useClass: DrizzleRolesRepository,
    },
  ],
  exports: [RolesService, RolesRepository],
})
export class RolesModule {}
