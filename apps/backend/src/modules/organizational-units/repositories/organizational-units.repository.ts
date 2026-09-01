import { OrganizationalUnitsModel } from '../models/organizational-units.model';
import {
  CreateOrganizationalUnitData,
  UpdateOrganizationalUnitData,
} from '../types/organizational-units.types';

export abstract class OrganizationalUnitsRepository {
  abstract findAll(officeId?: string): Promise<OrganizationalUnitsModel[]>;
  abstract findById(
    id: string,
    officeId?: string,
  ): Promise<OrganizationalUnitsModel | null>;
  abstract findByCode(
    code: string,
    officeId?: string,
  ): Promise<OrganizationalUnitsModel | null>;
  abstract create(
    data: CreateOrganizationalUnitData,
  ): Promise<OrganizationalUnitsModel>;
  abstract update(
    id: string,
    data: Partial<UpdateOrganizationalUnitData>,
    officeId?: string,
  ): Promise<OrganizationalUnitsModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    officeId?: string,
  ): Promise<OrganizationalUnitsModel | null>;
}
