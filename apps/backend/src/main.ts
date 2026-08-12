import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { configureApplication } from './configure-application';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  configureApplication(app);

  const port = configService.get<number>('PORT', 3000);

  const config = new DocumentBuilder()
    .setTitle('SIGIP API')
    .setDescription(
      'API REST del Sistema de Gestión de Incidencias de Personal. Todas las rutas usan el prefijo /api.',
    )
    .setVersion('1.0.0')
    .addCookieAuth(configService.getOrThrow<string>('auth.sessionCookieName'))
    .addServer(`http://localhost:${port ?? 3000}`, 'Servidor local')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);
}

void bootstrap();
