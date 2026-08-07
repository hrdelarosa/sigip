import type { PositionModel } from '../models/position.model';
import type {
  CreatePositionData,
  UpdatePositionData,
} from '../types/position.types';

export abstract class PositionsRepository {
  abstract findAll(): Promise<PositionModel[]>;
  abstract findById(id: string): Promise<PositionModel | null>;
  abstract findByCode(code: string): Promise<PositionModel | null>;
  abstract create(data: CreatePositionData): Promise<PositionModel>;
  abstract update(
    id: string,
    data: UpdatePositionData,
  ): Promise<PositionModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
  ): Promise<PositionModel | null>;
}
