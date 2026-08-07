import { customType } from 'drizzle-orm/mysql-core';

const uuidBinaryColumn = customType<{
  data: Buffer;
  driverData: Buffer;
}>({
  dataType() {
    return 'binary(16)';
  },
});

export const uuidBinary = (name: string) => uuidBinaryColumn(name);
