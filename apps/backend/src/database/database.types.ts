import type { defineRelations } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

import type * as schema from './schema';

type DatabaseRelations = ReturnType<typeof defineRelations<typeof schema>>;

export type DrizzleDatabase = MySql2Database<DatabaseRelations>;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDatabase['transaction']>[0]
>[0];
