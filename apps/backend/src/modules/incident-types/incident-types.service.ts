import { Injectable } from '@nestjs/common';
import {
  IncidentTypeCodeAlreadyExistsError,
  EmptyIncidentTypeUpdateError,
  IncidentTypeNotFoundError,
  IncidentTypePersistenceError,
} from './incident-types.errors';

import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { CreateIncidentTypeDto } from './dto/create-incident-type.dto';
import { UpdateIncidentTypeDto } from './dto/update-incident-type.dto';
import { UpdateIncidentTypeStatusDto } from './dto/update-incident-type-status.dto';
import { ListIncidentTypesQueryDto } from './dto/list-incident-types-query.dto';
import { IncidentTypesRepository } from './repositories/incident-types.repository';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { hasMysqlErrorCode } from '../../database/utils/mysql-error.util';

@Injectable()
export class IncidentTypesService {
  constructor(private readonly repository: IncidentTypesRepository) {}

  findAll(query: ListIncidentTypesQueryDto) {
    return this.repository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search?.trim(),
      isActive: query.isActive,
      temporalMode: query.temporalMode,
      appointmentScope: query.appointmentScope,
    });
  }

  async findById(id: string) {
    const incidentType = await this.repository.findById(id);

    if (!incidentType) {
      throw new IncidentTypeNotFoundError(id);
    }

    return incidentType;
  }

  async create(dto: CreateIncidentTypeDto, actor: AuthenticatedUserModel) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.repository.findByCode(code);

    if (existing) {
      throw new IncidentTypeCodeAlreadyExistsError(code);
    }

    try {
      return await this.repository.create(
        {
          id: generateUuidV7(),
          code,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          temporalMode: dto.temporalMode,
          appointmentScope: dto.appointmentScope,
          sortOrder: dto.sortOrder ?? 0,
        },
        { userId: actor.userId, sessionId: actor.sessionId },
      );
    } catch (error) {
      if (hasMysqlErrorCode(error, 'ER_DUP_ENTRY')) {
        throw new IncidentTypeCodeAlreadyExistsError(code);
      }

      throw new IncidentTypePersistenceError();
    }
  }

  async update(
    id: string,
    dto: UpdateIncidentTypeDto,
    actor: AuthenticatedUserModel,
  ) {
    await this.findById(id);

    if (Object.values(dto).every((value) => value === undefined)) {
      throw new EmptyIncidentTypeUpdateError();
    }

    const result = await this.repository.update(
      id,
      {
        name: dto.name?.trim(),
        description:
          dto.description !== undefined
            ? dto.description?.trim() || null
            : undefined,
        temporalMode: dto.temporalMode,
        appointmentScope: dto.appointmentScope,
        sortOrder: dto.sortOrder,
        updatedAt: new Date(),
      },
      { userId: actor.userId, sessionId: actor.sessionId },
    );

    if (!result) {
      throw new IncidentTypeNotFoundError(id);
    }

    return result;
  }

  async updateStatus(
    id: string,
    dto: UpdateIncidentTypeStatusDto,
    actor: AuthenticatedUserModel,
  ) {
    const result = await this.repository.updateStatus(
      id,
      dto.isActive,
      new Date(),
      { userId: actor.userId, sessionId: actor.sessionId },
    );

    if (!result) {
      throw new IncidentTypeNotFoundError(id);
    }

    return result;
  }
}
