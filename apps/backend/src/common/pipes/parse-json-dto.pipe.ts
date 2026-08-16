import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { Type } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ParseJsonDtoPipe<T> implements PipeTransform<string, Promise<T>> {
  constructor(private readonly dtoClass: Type<T>) {}

  async transform(value: string): Promise<T> {
    if (typeof value !== 'string') {
      throw new BadRequestException('El campo data es obligatorio');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(value);
    } catch {
      throw new BadRequestException('El campo data debe contener JSON válido');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BadRequestException(
        'El campo data debe contener un objeto JSON',
      );
    }

    const instance = plainToInstance(this.dtoClass, parsed);

    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return instance;
  }
}
