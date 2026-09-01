import { Injectable } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsRepository } from './repositories/positions.repository';
import {
  EmptyPositionUpdateError,
  PositionCodeAlreadyExistsError,
  PositionHasCurrentOrFutureAssignmentsError,
  PositionNotFoundError,
  PositionPersistenceError,
} from './positions.error';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { UpdatePositionStatusDto } from './dto/update-position-status.dto';
import { hasMysqlErrorCode } from '../../database/utils/mysql-error.util';
import type { PositionModel } from './models/position.model';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { getOfficeScope } from '../../common/authorization/office-scope';

@Injectable()
export class PositionsService {
  constructor(private readonly positionsRepository: PositionsRepository) {}

  private normalizeDescription(description?: string | null): string | null {
    if (!description) return null;

    const normalized = description.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private handlePersistenceError(error: unknown): never {
    if (error instanceof PositionHasCurrentOrFutureAssignmentsError) {
      throw error;
    }

    if (hasMysqlErrorCode(error, 'ER_DUP_ENTRY')) {
      throw new PositionCodeAlreadyExistsError();
    }

    throw new PositionPersistenceError();
  }

  async findAll(actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    return await this.positionsRepository.findAll(
      scope.canAccessAllOffices ? undefined : scope.officeId,
    );
  }

  async findById(id: string, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const position = await this.positionsRepository.findById(id, officeId);

    if (!position) throw new PositionNotFoundError();

    const employees = await this.positionsRepository.findEmployeesByPositionId(
      id,
      officeId,
    );

    return {
      ...position,
      assignmentCount: employees.length,
      employees,
    };
  }

  async create(dto: CreatePositionDto, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    const officeId = scope.officeId;
    const normalizedCode = dto.code.trim().toUpperCase();
    const existingPosition = await this.positionsRepository.findByCode(
      normalizedCode,
      scope.canAccessAllOffices ? undefined : officeId,
    );

    if (existingPosition) throw new PositionCodeAlreadyExistsError();

    try {
      return await this.positionsRepository.create({
        id: generateUuidV7(),
        officeId,
        code: normalizedCode,
        name: dto.name.trim(),
        description: this.normalizeDescription(dto.description),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(
    id: string,
    dto: UpdatePositionDto,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    await this.findById(id, actor);

    if (dto.name === undefined && dto.description === undefined) {
      throw new EmptyPositionUpdateError();
    }

    let updatePosition: PositionModel | null;

    try {
      updatePosition = await this.positionsRepository.update(
        id,
        {
          name: dto.name !== undefined ? dto.name.trim() : undefined,
          description:
            dto.description !== undefined
              ? this.normalizeDescription(dto.description)
              : undefined,
          updatedAt: new Date(),
        },
        officeId,
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatePosition) throw new PositionNotFoundError();

    return updatePosition;
  }

  async updateStatus(
    id: string,
    dto: UpdatePositionStatusDto,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    let updatePosition: PositionModel | null;

    try {
      updatePosition = await this.positionsRepository.updateStatus(
        id,
        dto.isActive,
        new Date(),
        scope.canAccessAllOffices ? undefined : scope.officeId,
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatePosition) throw new PositionNotFoundError();

    return updatePosition;
  }
}
