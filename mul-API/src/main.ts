import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurable API base path
  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX') || 'mul-api';
  app.setGlobalPrefix(apiPrefix);
  
  // Enable CORS - Allow all origins in development
  app.enableCors({
    // origin: ['http://localhost:5000', 'http://127.0.0.1:3000'],
    origin: true, // Allows all origins (use specific origins in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(Number(port), '0.0.0.0');
}

bootstrap().catch(err => {
  console.error('Failed to start application', err);
});