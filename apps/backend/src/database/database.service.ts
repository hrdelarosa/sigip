import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { MYSQL_POOL } from './database.constants';
import type { Pool } from 'mysql2';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(MYSQL_POOL)
    private readonly pool: Pool,
  ) {}

  async onModuleInit(): Promise<void> {
    const connection = await this.pool.promise().getConnection();

    try {
      await connection.ping();

      this.logger.log('Conexión a la base de datos establecida correctamente');
    } finally {
      connection.release();
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.promise().end();

    this.logger.log('Pool de conexiones MySQL cerrado correctamente');
  }
}
