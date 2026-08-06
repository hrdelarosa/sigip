import { Injectable } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsRepository } from './repositories/positions.repository';
import {
  PositionCodeAlreadyExistsError,
  PositionNotFoundError,
} from './positions.error';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { UpdatePositionStatusDto } from './dto/update-position-status.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly positionsRepository: PositionsRepository) {}

  private normalizeDescription(description?: string | null): string | null {
    if (!description) return null;

    const normalized = description.trim();

    return normalized.length > 0 ? normalized : null;
  }

  async findAll() {
    return await this.positionsRepository.findAll();
  }

  async findById(id: string) {
    const position = await this.positionsRepository.findById(id);

    if (!position) throw new PositionNotFoundError();

    return position;
  }

  async create(dto: CreatePositionDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existingPosition =
      await this.positionsRepository.findByCode(normalizedCode);

    if (existingPosition) throw new PositionCodeAlreadyExistsError();

    return this.positionsRepository.create({
      id: generateUuidV7(),
      code: normalizedCode,
      name: dto.name.trim(),
      description: this.normalizeDescription(dto.description),
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.findById(id);

    const updatePosition = await this.positionsRepository.update(id, {
      name: dto.name !== undefined ? dto.name.trim() : undefined,
      description:
        dto.description !== undefined
          ? this.normalizeDescription(dto.description)
          : undefined,
      updatedAt: new Date(),
    });

    if (!updatePosition) throw new PositionNotFoundError();

    return updatePosition;
  }

  async updateStatus(id: string, dto: UpdatePositionStatusDto) {
    const position = await this.positionsRepository.findById(id);

    if (position?.isActive === dto.isActive) return position;

    const updatePosition = await this.positionsRepository.updateStatus(
      id,
      dto.isActive,
      new Date(),
    );

    if (!updatePosition) throw new PositionNotFoundError();

    return updatePosition;
  }
}
