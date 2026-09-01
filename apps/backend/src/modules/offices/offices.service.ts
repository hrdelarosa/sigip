import { Injectable } from '@nestjs/common';
import type { OfficeModel } from './models/office.model';
import { OfficeNotFoundError } from './offices.errors';
import { OfficesRepository } from './repositories/offices.repository';

@Injectable()
export class OfficesService {
  constructor(private readonly officesRepository: OfficesRepository) {}

  findAll(): Promise<OfficeModel[]> {
    return this.officesRepository.findAll();
  }

  async findById(id: string): Promise<OfficeModel> {
    const office = await this.officesRepository.findById(id);

    if (!office) {
      throw new OfficeNotFoundError();
    }

    return office;
  }

  async ensureActive(id: string): Promise<OfficeModel> {
    const office = await this.findById(id);

    if (!office.isActive) {
      throw new OfficeNotFoundError();
    }

    return office;
  }
}
