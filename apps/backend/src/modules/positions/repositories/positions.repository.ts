import type {
  PositionEmployeeModel,
  PositionModel,
} from '../models/position.model';
import type {
  CreatePositionData,
  UpdatePositionData,
} from '../types/position.types';

export abstract class PositionsRepository {
  abstract findAll(officeId?: string): Promise<PositionModel[]>;
  abstract findById(
    id: string,
    officeId?: string,
  ): Promise<PositionModel | null>;
  abstract findEmployeesByPositionId(
    id: string,
    officeId?: string,
  ): Promise<PositionEmployeeModel[]>;
  abstract findByCode(
    code: string,
    officeId?: string,
  ): Promise<PositionModel | null>;
  abstract create(data: CreatePositionData): Promise<PositionModel>;
  abstract update(
    id: string,
    data: UpdatePositionData,
    officeId?: string,
  ): Promise<PositionModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    officeId?: string,
  ): Promise<PositionModel | null>;
}
