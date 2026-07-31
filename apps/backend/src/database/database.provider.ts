import type { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { defineRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql, { type Pool } from 'mysql2';

import databaseConfig from '../config/database.config';
import { DRIZZLE_DATABASE, MYSQL_POOL } from './database.constants';
import type { DrizzleDatabase } from './database.types';
import * as schema from './schema';

export const mysqlPoolProvider: Provider<Pool> = {
  provide: MYSQL_POOL,
  inject: [databaseConfig.KEY],

  useFactory: (config: ConfigType<typeof databaseConfig>): Pool => {
    if (!config.url) {
      throw new Error('La variable DATABASE_URL no está configurada');
    }

    return mysql.createPool({
      uri: config.url,
      connectionLimit: config.connectionLimit ?? 10,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  },
};

export const drizzleProvider: Provider<DrizzleDatabase> = {
  provide: DRIZZLE_DATABASE,
  inject: [MYSQL_POOL],

  useFactory: (pool: Pool): DrizzleDatabase => {
    return drizzle({
      client: pool,
      relations: defineRelations(schema),
    });
  },
};
