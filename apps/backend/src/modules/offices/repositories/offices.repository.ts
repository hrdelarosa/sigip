import { OfficeModel } from '../models/office.model';

export abstract class OfficesRepository {
  abstract findAll(): Promise<OfficeModel[]>;
  abstract findById(id: string): Promise<OfficeModel | null>;
}
