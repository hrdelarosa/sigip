import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import type { SessionsResponse } from '@sigip/shared';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { UserSessionParamDto } from './dto/user-session-param.dto';
import { UserSessionsParamDto } from './dto/user-sessions-param.dto';
import { toSessionsResponse } from './presenters/session.presenter';
import { SessionsService } from './sessions.service';

@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('users/:userId/sessions')
  @RequirePermissions('sessions:read')
  async findForUser(
    @Param() params: UserSessionsParamDto,
    @CurrentUser() user: AuthenticatedUserModel,
  ): Promise<SessionsResponse> {
    const sessions = await this.sessionsService.findAllForUser(params.userId);
    return toSessionsResponse(sessions, user.sessionId);
  }

  @Delete('users/:userId/sessions/:id')
  @RequirePermissions('sessions:revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeForUser(
    @Param() params: UserSessionParamDto,
    @CurrentUser() user: AuthenticatedUserModel,
  ): Promise<void> {
    await this.sessionsService.revokeForUser(
      params.id,
      params.userId,
      user.userId,
      user.sessionId,
    );
  }
}
