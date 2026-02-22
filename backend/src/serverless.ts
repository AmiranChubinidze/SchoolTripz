import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import type { Request, Response } from 'express';

let app: NestExpressApplication | null = null;

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

function applyCorsHeaders(req: Request, res: Response): void {
  const origin = req.headers.origin as string | undefined;
  const allowed = getAllowedOrigins();
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
    res.setHeader('Vary', 'Origin');
  }
}

async function getApp(): Promise<NestExpressApplication> {
  if (app) return app;

  app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowed = getAllowedOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowed.includes(origin)) callback(null, true);
      else callback(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  });

  await app.init();
  return app;
}

export default async (req: Request, res: Response): Promise<void> => {
  // Handle OPTIONS preflight immediately — no cold-start delay
  if (req.method === 'OPTIONS') {
    applyCorsHeaders(req, res);
    res.status(204).end();
    return;
  }

  try {
    const nestApp = await getApp();
    const expressInstance = nestApp.getHttpAdapter().getInstance();
    expressInstance(req, res);
  } catch (err: any) {
    console.error('[serverless] init error:', err?.message ?? err);
    applyCorsHeaders(req, res);
    res.status(500).json({
      statusCode: 500,
      message: 'Server failed to initialise',
      detail: err?.message ?? String(err),
    });
  }
};
