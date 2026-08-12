import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { AuthMeResponse, LoginResponse } from '@sigip/shared';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUserModel } from './models/authenticated-user.model';
import { SessionsService } from '../sessions/sessions.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { clearSessionCookie, setSessionCookie } from './session-cookie';
import { toAuthenticatedUserResponse } from './presenters/auth.presenter';

@Controller('auth')
export class AuthController {
  private readonly cookieConfig: { name: string; secure: boolean };

  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
    configService: ConfigService,
  ) {
    this.cookieConfig = {
      name: configService.getOrThrow<string>('auth.sessionCookieName'),
      secure: configService.getOrThrow<boolean>('auth.secureCookie'),
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const result = await this.authService.login(dto, {
      ipAddress: request.ip?.slice(0, 45) ?? null,
      userAgent: request.get('user-agent')?.slice(0, 500) ?? null,
    });

    setSessionCookie(
      response,
      result.token,
      result.absoluteExpiresAt,
      this.cookieConfig,
    );

    return toAuthenticatedUserResponse(result.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUserModel,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.sessionsService.revokeCurrent(user);
    clearSessionCookie(response, this.cookieConfig);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUserModel): AuthMeResponse {
    return toAuthenticatedUserResponse(user);
  }
}
