import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  // Validate required environment variables
  const requiredEnvVars = [
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
