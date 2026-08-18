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
import {
  assignmentsSeed,
  employeesSeed,
  organizationalUnitsSeed,
  positionsSeed,
} from './organization.seed-data';
import { incidentTypesSeed } from './incident-types.seed-data';

interface IdentifierRow extends RowDataPacket {
  id: Buffer;
  code: string;
}

const uuidBuffer = (): Buffer => {
  return Buffer.from(uuidv7().replaceAll('-', ''), 'hex');
};

const namedUuidBuffer = (name: string): Buffer =>
  Buffer.from(name.replaceAll('-', ''), 'hex');

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

    for (const unit of organizationalUnitsSeed) {
      await connection.execute(
        `INSERT INTO organizational_units (id, parent_id, code, name, description, is_active, sort_order)
         VALUES (?, NULL, ?, ?, ?, true, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), is_active = VALUES(is_active), sort_order = VALUES(sort_order)`,
        [uuidBuffer(), unit[0], unit[1], `Área operativa de ${unit[1]}.`, 0],
      );
    }

    for (const position of positionsSeed) {
      await connection.execute(
        `INSERT INTO positions (id, code, name, description, is_active)
         VALUES (?, ?, ?, ?, true)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), is_active = VALUES(is_active)`,
        [uuidBuffer(), position[0], position[1], `Puesto de ${position[1]}.`],
      );
    }

    for (const incidentType of incidentTypesSeed) {
      await connection.execute(
        `INSERT INTO incident_types
       (
         id,
         code,
         name,
         description,
         temporal_mode,
         appointment_scope,
         is_active,
         sort_order
       )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       description = VALUES(description),
       temporal_mode = VALUES(temporal_mode),
       appointment_scope = VALUES(appointment_scope),
       is_active = VALUES(is_active),
       sort_order = VALUES(sort_order)`,
        [
          uuidBuffer(),
          incidentType.code,
          incidentType.name,
          incidentType.description,
          incidentType.temporalMode,
          incidentType.appointmentScope,
          incidentType.isActive,
          incidentType.sortOrder,
        ],
      );
    }

    for (const employee of employeesSeed) {
      await connection.execute(
        `INSERT INTO employees (id, employee_number, full_name, hire_date, status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), hire_date = VALUES(hire_date), status = VALUES(status)`,
        [
          uuidBuffer(),
          employee.employeeNumber,
          employee.fullName,
          employee.hireDate,
          employee.status,
        ],
      );
    }

    const [unitRows] = await connection.query<IdentifierRow[]>(
      'SELECT id, code FROM organizational_units',
    );
    const [positionRows] = await connection.query<IdentifierRow[]>(
      'SELECT id, code FROM positions',
    );
    const [employeeRows] = await connection.query<IdentifierRow[]>(
      'SELECT id, employee_number AS code FROM employees',
    );
    const unitIds = new Map(unitRows.map(({ code, id }) => [code, id]));
    const positionIds = new Map(positionRows.map(({ code, id }) => [code, id]));
    const employeeIds = new Map(employeeRows.map(({ code, id }) => [code, id]));

    for (const [index, assignment] of assignmentsSeed.entries()) {
      const employeeId = employeeIds.get(assignment.employeeNumber);
      const unitId = unitIds.get(assignment.unitCode);
      const positionId = positionIds.get(assignment.positionCode);
      if (!employeeId || !unitId || !positionId)
        throw new Error(
          `Referencias inválidas en la asignación ${assignment.employeeNumber}`,
        );
      await connection.execute(
        `INSERT INTO employee_assignments (id, employee_id, organizational_unit_id, position_id, appointment_type, schedule, effective_from, effective_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE employee_id = VALUES(employee_id), organizational_unit_id = VALUES(organizational_unit_id), position_id = VALUES(position_id), appointment_type = VALUES(appointment_type), schedule = VALUES(schedule), effective_from = VALUES(effective_from), effective_to = VALUES(effective_to)`,
        [
          namedUuidBuffer(
            `00000000-0000-7000-8000-${String(index + 1).padStart(12, '0')}`,
          ),
          employeeId,
          unitId,
          positionId,
          assignment.appointmentType,
          assignment.schedule,
          assignment.effectiveFrom,
          assignment.effectiveTo ?? null,
        ],
      );
    }

    await connection.commit();

    console.log(
      `Seed completado: ${rolesSeed.length} roles, ${permissionsSeed.length} permisos, ${incidentTypesSeed.length} tipos de incidencia, ${employeesSeed.length} empleados y ${assignmentsSeed.length} asignaciones.`,
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
