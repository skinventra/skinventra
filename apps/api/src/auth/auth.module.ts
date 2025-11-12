import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SteamStrategy } from './steam.strategy';
import { SessionSerializer } from './session.serializer';
import { SessionValidationMiddleware } from './middleware/session-validation.middleware';
import { UserContextMiddleware } from './middleware/user-context.middleware';
import { AuthLoggingMiddleware } from './middleware/auth-logging.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';

@Module({
  imports: [PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [
    AuthService,
    SteamStrategy,
    SessionSerializer,
    SessionValidationMiddleware,
    UserContextMiddleware,
    AuthLoggingMiddleware,
    RateLimitMiddleware,
  ],
  exports: [AuthService],
})
export class AuthModule {}
