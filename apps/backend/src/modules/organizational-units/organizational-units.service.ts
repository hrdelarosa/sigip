import { Injectable } from '@nestjs/common';
import { CreateOrganizationalUnitDto } from './dto/create-organizational-unit.dto';
import { UpdateOrganizationalUnitDto } from './dto/update-organizational-unit.dto';
import { OrganizationalUnitsRepository } from './repositories/organizational-units.repository';
import {
  EmptyOrganizationalUnitUpdateError,
  InvalidOrganizationalUnitParentError,
  OrganizationalUnitCodeAlreadyExistsError,
  OrganizationalUnitsNotFoundError,
} from './organizational-units.errors';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { UpdateOrganizationalUnitStatusDto } from './dto/update-organizational-unit-status.dto';
import { hasMysqlErrorCode } from '../../database/utils/mysql-error.util';
import type { OrganizationalUnitsModel } from './models/organizational-units.model';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';

@Injectable()
export class OrganizationalUnitsService {
  constructor(
    private readonly organizationalUnitsRepository: OrganizationalUnitsRepository,
  ) {}

  private normalizeDescription(description?: string | null): string | null {
    if (!description) return null;

    const normalized = description.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private handlePersistenceError(error: unknown): never {
    if (hasMysqlErrorCode(error, 'ER_DUP_ENTRY')) {
      throw new OrganizationalUnitCodeAlreadyExistsError();
    }

    if (
      hasMysqlErrorCode(error, 'ER_NO_REFERENCED_ROW_2') ||
      hasMysqlErrorCode(error, 'ER_ROW_IS_REFERENCED_2')
    ) {
      throw new InvalidOrganizationalUnitParentError();
    }

    throw error;
  }

  async findAll(_actor: AuthenticatedUserModel) {
    return await this.organizationalUnitsRepository.findAll();
  }

  async findById(id: string, _actor: AuthenticatedUserModel) {
    const organizationalUnit =
      await this.organizationalUnitsRepository.findById(id);

    if (!organizationalUnit) throw new OrganizationalUnitsNotFoundError();

    return organizationalUnit;
  }

  async create(
    dto: CreateOrganizationalUnitDto,

    _actor: AuthenticatedUserModel,
  ) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existingOrganizationalUnit =
      await this.organizationalUnitsRepository.findByCode(normalizedCode);

    if (existingOrganizationalUnit)
      throw new OrganizationalUnitCodeAlreadyExistsError();

    if (dto.parentId) {
      const parent = await this.organizationalUnitsRepository.findById(
        dto.parentId,
      );

      if (!parent) {
        throw new InvalidOrganizationalUnitParentError();
      }
    }

    try {
      return await this.organizationalUnitsRepository.create({
        id: generateUuidV7(),
        parentId: dto.parentId,
        code: normalizedCode,
        name: dto.name.trim(),
        description: this.normalizeDescription(dto.description),
        sortOrder: dto.sortOrder ?? 0,
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateOrganizationalUnitDto,
    _actor: AuthenticatedUserModel,
  ) {
    if (
      dto.parentId === undefined &&
      dto.name === undefined &&
      dto.description === undefined &&
      dto.sortOrder === undefined
    ) {
      throw new EmptyOrganizationalUnitUpdateError();
    }

    let updatedOrganizationalUnit: OrganizationalUnitsModel | null;

    try {
      updatedOrganizationalUnit =
        await this.organizationalUnitsRepository.update(id, {
          parentId: dto.parentId,
          name: dto.name !== undefined ? dto.name.trim() : undefined,
          description:
            dto.description !== undefined
              ? this.normalizeDescription(dto.description)
              : undefined,
          sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : undefined,
          updatedAt: new Date(),
        });
    } catch (error) {
      this.handlePersistenceError(error);
    }

    if (!updatedOrganizationalUnit)
      throw new OrganizationalUnitsNotFoundError();

    return updatedOrganizationalUnit;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrganizationalUnitStatusDto,
    _actor: AuthenticatedUserModel,
  ) {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsRepository.updateStatus(
        id,
        dto.isActive,
        new Date(),
      );

    if (!updatedOrganizationalUnit)
      throw new OrganizationalUnitsNotFoundError();

    return updatedOrganizationalUnit;
  }
}
