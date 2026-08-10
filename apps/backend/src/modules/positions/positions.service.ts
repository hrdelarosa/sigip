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

  async findAll() {
    return await this.positionsRepository.findAll();
  }

  async findById(id: string) {
    const position = await this.positionsRepository.findById(id);

    if (!position) throw new PositionNotFoundError();

    const employees =
      await this.positionsRepository.findEmployeesByPositionId(id);

    return {
      ...position,
      assignmentCount: employees.length,
      employees,
    };
  }

  async create(dto: CreatePositionDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existingPosition =
      await this.positionsRepository.findByCode(normalizedCode);

    if (existingPosition) throw new PositionCodeAlreadyExistsError();

    try {
      return await this.positionsRepository.create({
        id: generateUuidV7(),
        code: normalizedCode,
        name: dto.name.trim(),
        description: this.normalizeDescription(dto.description),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.findById(id);

    if (dto.name === undefined && dto.description === undefined) {
      throw new EmptyPositionUpdateError();
    }

    let updatePosition: PositionModel | null;

    try {
      updatePosition = await this.positionsRepository.update(id, {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        description:
          dto.description !== undefined
            ? this.normalizeDescription(dto.description)
            : undefined,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatePosition) throw new PositionNotFoundError();

    return updatePosition;
  }

  async updateStatus(id: string, dto: UpdatePositionStatusDto) {
    let updatePosition: PositionModel | null;

    try {
      updatePosition = await this.positionsRepository.updateStatus(
        id,
        dto.isActive,
        new Date(),
      );
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatePosition) throw new PositionNotFoundError();

    return updatePosition;
  }
}
