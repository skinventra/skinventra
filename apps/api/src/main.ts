import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  // Validate required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'STEAM_API_KEY',
    'STEAM_REALM',
    'STEAM_RETURN_URL',
    'FRONTEND_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.',
    );
  }

  const app = await NestFactory.create(AppModule);

  // In development, proxy non-API requests to Vite dev server
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const viteProxy = createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying for HMR
    });
    
    // Apply proxy only to non-API routes
    app.use((req, res, next) => {
      if (req.url.startsWith('/api')) {
        return next();
      }
      viteProxy(req, res, next);
    });
  }

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL, process.env.STEAM_REALM].filter(Boolean),
    credentials: true,
  });

  // Configure session
  const sessionSecret = process.env.SESSION_SECRET!;

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        // Secure cookies only in production
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
