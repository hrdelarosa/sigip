import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { PositionsRepository } from './repositories/positions.repository';
import { DrizzlePositionsRepository } from './repositories/drizzle-positions.repository';

@Module({
  controllers: [PositionsController],
  providers: [
    PositionsService,
    {
      provide: PositionsRepository,
      useClass: DrizzlePositionsRepository,
    },
  ],
  exports: [PositionsService, PositionsRepository],
})
export class PositionsModule {}
