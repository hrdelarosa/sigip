import type { PositionResponse } from '@sigip/shared';
import type { PositionModel } from '../models/position.model';

export function toPositionResponse(position: PositionModel): PositionResponse {
  return {
    id: position.id,
    code: position.code,
    name: position.name,
    description: position.description ?? null,
    isActive: position.isActive,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}
