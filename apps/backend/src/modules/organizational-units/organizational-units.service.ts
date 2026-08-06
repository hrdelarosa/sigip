import { Injectable } from '@nestjs/common';
import { CreateOrganizationalUnitDto } from './dto/create-organizational-unit.dto';
import { UpdateOrganizationalUnitDto } from './dto/update-organizational-unit.dto';
import { OrganizationalUnitsRepository } from './repositories/organizational-units.repository';
import {
  OrganizationalUnitCodeAlreadyExistsError,
  OrganizationalUnitsNotFoundError,
} from './organizational-units.errors';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { UpdateOrganizationalUnitStatusDto } from './dto/update-organizational-unit-status.dto';

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

  async findAll() {
    return await this.organizationalUnitsRepository.findAll();
  }

  async findById(id: string) {
    const organizationalUnit =
      await this.organizationalUnitsRepository.findById(id);

    if (!organizationalUnit) throw new OrganizationalUnitsNotFoundError();

    return organizationalUnit;
  }

  async create(dto: CreateOrganizationalUnitDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existingOrganizationalUnit =
      await this.organizationalUnitsRepository.findByCode(normalizedCode);

    if (existingOrganizationalUnit)
      throw new OrganizationalUnitCodeAlreadyExistsError();

    return this.organizationalUnitsRepository.create({
      id: generateUuidV7(),
      parentId: dto.parentId,
      code: normalizedCode,
      name: dto.name.trim(),
      description: this.normalizeDescription(dto.description),
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async update(id: string, dto: UpdateOrganizationalUnitDto) {
    await this.findById(id);

    const updatedOrganizationalUnit =
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

    if (!updatedOrganizationalUnit)
      throw new OrganizationalUnitsNotFoundError();

    return updatedOrganizationalUnit;
  }

  async updateStatus(id: string, dto: UpdateOrganizationalUnitStatusDto) {
    const organizationalUnit = await this.findById(id);

    if (organizationalUnit.isActive === dto.isActive) return organizationalUnit;

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
