import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { SessionValidationMiddleware } from './auth/middleware/session-validation.middleware';
import { UserContextMiddleware } from './auth/middleware/user-context.middleware';
import { AuthLoggingMiddleware } from './auth/middleware/auth-logging.middleware';
import { RateLimitMiddleware } from './auth/middleware/rate-limit.middleware';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    // Serve static files from client build only in production
    ...(isProduction
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(
              __dirname,
              '..',
              '..',
              '..',
              '..',
              'apps',
              'client',
              'dist',
            ),
            exclude: ['/api*'], // Exclude API routes from static serving
            serveRoot: '/',
            renderPath: '*', // Serve index.html for all non-API routes (SPA support)
          }),
        ]
      : []),
    PrismaModule,
    AuthModule,
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('auth/steam', 'auth/steam/callback');

    consumer
      .apply(SessionValidationMiddleware, AuthLoggingMiddleware)
      .forRoutes('*');

    consumer
      .apply(UserContextMiddleware)
      .forRoutes('portfolios', 'auth/user');
  }
}
