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
  private readonly frontendOrigin: string;

  constructor(configService: ConfigService) {
    this.frontendOrigin = configService.getOrThrow<string>(
      'auth.frontendOrigin',
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) return true;

    const origin = request.get('origin');
    if (!origin) throw new ForbiddenException('Origen requerido');

    const apiOrigin = `${request.protocol}://${request.get('host')}`;
    if (origin !== this.frontendOrigin && origin !== apiOrigin) {
      throw new ForbiddenException('Origen no permitido');
    }

    return true;
  }
}
