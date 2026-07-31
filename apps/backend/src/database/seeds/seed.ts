import * as argon2 from 'argon2';
import { config } from 'dotenv';
import mysql, { type RowDataPacket } from 'mysql2/promise';
import { resolve } from 'node:path';
import { v7 as uuidv7 } from 'uuid';

import {
  developmentAdministrator,
  permissionsSeed,
  rolesSeed,
} from './access-control.seed-data';

interface IdentifierRow extends RowDataPacket {
  id: Buffer;
  code: string;
}

const uuidBuffer = (): Buffer => {
  return Buffer.from(uuidv7().replaceAll('-', ''), 'hex');
};

const loadEnvironment = (): void => {
  config({
    path: [
      resolve(process.cwd(), 'apps/backend/.env'),
      resolve(process.cwd(), '.env'),
    ],
    quiet: true,
  });
};

const seed = async (): Promise<void> => {
  loadEnvironment();

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'El seed de desarrollo no puede ejecutarse con NODE_ENV=production.',
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está configurada.');
  }

  const connection = await mysql.createConnection(databaseUrl);

  try {
    await connection.beginTransaction();

    for (const permission of permissionsSeed) {
      await connection.execute(
        `INSERT INTO permissions (id, code, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [uuidBuffer(), permission.code, permission.description],
      );
    }

    for (const role of rolesSeed) {
      await connection.execute(
        `INSERT INTO roles (id, code, name, description, is_active)
         VALUES (?, ?, ?, ?, true)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           is_active = VALUES(is_active)`,
        [uuidBuffer(), role.code, role.name, role.description],
      );
    }

    const [permissionRows] = await connection.query<IdentifierRow[]>(
      'SELECT id, code FROM permissions',
    );
    const [roleRows] = await connection.query<IdentifierRow[]>(
      'SELECT id, code FROM roles',
    );
    const permissionIds = new Map(
      permissionRows.map(({ code, id }) => [code, id]),
    );
    const roleIds = new Map(roleRows.map(({ code, id }) => [code, id]));

    for (const role of rolesSeed) {
      const roleId = roleIds.get(role.code);

      if (!roleId) {
        throw new Error(`No se encontró el rol sembrado: ${role.code}`);
      }

      await connection.execute(
        'DELETE FROM role_permissions WHERE role_id = ?',
        [roleId],
      );

      for (const permissionCode of role.permissions) {
        const permissionId = permissionIds.get(permissionCode);

        if (!permissionId) {
          throw new Error(
            `No se encontró el permiso sembrado: ${permissionCode}`,
          );
        }

        await connection.execute(
          `INSERT INTO role_permissions (role_id, permissions_id)
           VALUES (?, ?)`,
          [roleId, permissionId],
        );
      }
    }

    const administratorRoleId = roleIds.get(developmentAdministrator.roleCode);

    if (!administratorRoleId) {
      throw new Error('No se encontró el rol del administrador de desarrollo.');
    }

    const passwordHash = await argon2.hash(developmentAdministrator.password, {
      type: argon2.argon2id,
    });

    await connection.execute(
      `INSERT INTO users
         (id, role_id, username, full_name, password, is_active, last_login_at)
       VALUES (?, ?, ?, ?, ?, true, NULL)
       ON DUPLICATE KEY UPDATE
         role_id = VALUES(role_id),
         full_name = VALUES(full_name),
         password = VALUES(password),
         is_active = VALUES(is_active)`,
      [
        uuidBuffer(),
        administratorRoleId,
        developmentAdministrator.username,
        developmentAdministrator.fullName,
        passwordHash,
      ],
    );

    await connection.commit();

    console.log(
      `Seed completado: ${rolesSeed.length} roles, ${permissionsSeed.length} permisos y usuario '${developmentAdministrator.username}'.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};

void seed().catch((error: unknown) => {
  console.error('No fue posible ejecutar el seed.', error);
  process.exitCode = 1;
});
