import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

interface SessionWithPassport extends Session {
  passport?: {
    user: string;
  };
}

@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger('SessionValidation');

  use(req: Request, res: Response, next: NextFunction) {
    const session = req.session as SessionWithPassport;

    if (session?.passport?.user) {
      const userId = session.passport.user;
      this.logger.debug(`Active session found for user ID: ${userId}`);
    }

    if (session && this.isSessionExpired(session)) {
      this.logger.warn('Expired session detected, destroying...');
      session.destroy((err) => {
        if (err) {
          this.logger.error('Session destruction error:', err);
        }
      });
    }

    next();
  }

  private isSessionExpired(session: Session): boolean {
    if (!session.cookie?.expires) return false;

    const now = Date.now();
    const expires = new Date(session.cookie.expires).getTime();

    return now > expires;
  }
}
