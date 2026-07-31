import { sql } from 'drizzle-orm';
import { datetime } from 'drizzle-orm/mysql-core';

export const createdAtColumn = () =>
  datetime('created_at', {
    mode: 'date',
    fsp: 6,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`);

export const updatedAtColumn = () =>
  datetime('updated_at', {
    mode: 'date',
    fsp: 6,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`);
