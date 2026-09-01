import { Module } from '@nestjs/common';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';
import { OfficesRepository } from './repositories/offices.repository';
import { DrizzleOfficesRepository } from './repositories/drizzle-offices.repository';

@Module({
  controllers: [OfficesController],
  providers: [
    OfficesService,
    {
      provide: OfficesRepository,
      useClass: DrizzleOfficesRepository,
    },
  ],
  exports: [OfficesService, OfficesRepository],
})
export class OfficesModule {}
