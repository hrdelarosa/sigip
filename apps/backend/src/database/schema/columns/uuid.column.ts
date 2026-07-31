import { binary } from 'drizzle-orm/mssql-core';

export const uuidBinary = (name: string) =>
  binary(name, {
    length: 16,
  });
