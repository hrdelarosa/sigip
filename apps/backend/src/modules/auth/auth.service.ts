import { Injectable } from '@nestjs/common';

import { CryptoService } from '../../common/crypto/crypto.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from './dto/login.dto';
import { InvalidCredentialsError } from './auth.errors';

const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$0mosfeQ81C9JgkRsqo4BLA$dUY8sTr3KtSDaIiun2tiLnhW4BL+VLLClwR+3hxZ1Q4';

export interface LoginMetadata {
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly sessionsService: SessionsService,
  ) {}

  async login(dto: LoginDto, metadata: LoginMetadata) {
    const user = await this.usersRepository.findByUsernameWithPassword(
      dto.username,
    );
    const passwordMatches = await this.cryptoService.verifyPassword(
      dto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user?.isActive || !passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const result = await this.sessionsService.createLoginSession(
      user,
      metadata,
    );

    if (!result) throw new InvalidCredentialsError();

    return result;
  }
}
