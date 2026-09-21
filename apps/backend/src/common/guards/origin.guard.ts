import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class OriginGuard implements CanActivate {
  private readonly frontendOrigins: Set<string>;

  constructor(configService: ConfigService) {
    const origins = configService.getOrThrow<string>('auth.frontendOrigin');

    this.frontendOrigins = new Set(
      origins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) return true;

    const origin = request.get('origin');
    if (!origin) throw new ForbiddenException('Origen requerido');

    const apiOrigin = `${request.protocol}://${request.get('host')}`;
    if (!this.frontendOrigins.has(origin) && origin !== apiOrigin) {
      throw new ForbiddenException('Origen no permitido');
    }

    return true;
  }
}
