import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import type { SessionResponse, SessionsResponse } from '@sigip/shared';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { clearSessionCookie } from '../auth/session-cookie';
import { SessionIdParamDto } from './dto/session-id-param.dto';
import { UserSessionParamDto } from './dto/user-session-param.dto';
import { UserSessionsParamDto } from './dto/user-sessions-param.dto';
import {
  toSessionResponse,
  toSessionsResponse,
} from './presenters/session.presenter';
import { SessionsService } from './sessions.service';

@Controller()
export class SessionsController {
  private readonly cookieConfig: { name: string; secure: boolean };

  constructor(
    private readonly sessionsService: SessionsService,
    configService: ConfigService,
  ) {
    this.cookieConfig = {
      name: configService.getOrThrow<string>('auth.sessionCookieName'),
      secure: configService.getOrThrow<boolean>('auth.secureCookie'),
    };
  }

  @Get('sessions')
  async findOwn(
    @CurrentUser() user: AuthenticatedUserModel,
  ): Promise<SessionsResponse> {
    const sessions = await this.sessionsService.findAllForUser(user.userId);
    return toSessionsResponse(sessions, user.sessionId);
  }

  @Get('sessions/:id')
  async findOwnById(
    @Param() params: SessionIdParamDto,
    @CurrentUser() user: AuthenticatedUserModel,
  ): Promise<SessionResponse> {
    const session = await this.sessionsService.findByIdForUser(
      params.id,
      user.userId,
    );
    return toSessionResponse(session, user.sessionId);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeOwn(
    @Param() params: SessionIdParamDto,
    @CurrentUser() user: AuthenticatedUserModel,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.sessionsService.revokeForUser(
      params.id,
      user.userId,
      user.userId,
    );
    if (params.id === user.sessionId) {
      clearSessionCookie(response, this.cookieConfig);
    }
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeOwnSessions(
    @CurrentUser() user: AuthenticatedUserModel,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.sessionsService.revokeAllForUser(user.userId, user.userId);
    clearSessionCookie(response, this.cookieConfig);
  }

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
    );
  }

  @Delete('users/:userId/sessions')
  @RequirePermissions('sessions:revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllForUser(
    @Param() params: UserSessionsParamDto,
    @CurrentUser() user: AuthenticatedUserModel,
  ): Promise<void> {
    await this.sessionsService.revokeAllForUser(params.userId, user.userId);
  }
}
