import { foreignKey, mysqlTable, primaryKey } from 'drizzle-orm/mysql-core';

import { createdAtColumn } from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';
import { permissions } from './permissions.schema';
import { roles } from './roles.schema';

export const rolePermissions = mysqlTable(
  'role_permissions',
  {
    roleId: uuidBinary('role_id').notNull(),
    permissionId: uuidBinary('permissions_id').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.permissionId],
    }),

    foreignKey({
      name: 'role_permissions_role_id_roles_id_fk',
      columns: [table.roleId],
      foreignColumns: [roles.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),

    foreignKey({
      name: 'role_permissions_permission_id_permissions_id_fk',
      columns: [table.permissionId],
      foreignColumns: [permissions.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type RolePermissionRow = typeof rolePermissions.$inferSelect;
export type NewRolePermissionRow = typeof rolePermissions.$inferInsert;
