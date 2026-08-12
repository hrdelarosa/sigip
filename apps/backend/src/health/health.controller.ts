import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponse } from '../common/swagger/api.models';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
@ApiTags('Health')
@Public()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Comprobar el estado del servicio' })
  @ApiResponse({ status: 200, type: HealthResponse })
  checkHealth() {
    return {
      status: 'ok',
      service:
        'SIGIP - Sistema de Gestión de Incidencias de Personal (Backend)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
