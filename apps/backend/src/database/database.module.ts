import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import databaseConfig from '../config/database.config';
import { drizzleProvider, mysqlPoolProvider } from './database.provider';
import { DatabaseService } from './database.service';
import { DRIZZLE_DATABASE, MYSQL_POOL } from './database.constants';

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [mysqlPoolProvider, drizzleProvider, DatabaseService],
  exports: [MYSQL_POOL, DRIZZLE_DATABASE],
})
export class DatabaseModule {}
