import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export function configureApplication(app: NestExpressApplication): void {
  const configService = app.get(ConfigService);
  const trustProxyHops = configService.getOrThrow<number>(
    'auth.trustProxyHops',
  );

  if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: configService.getOrThrow<string>('auth.frontendOrigin'),
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
