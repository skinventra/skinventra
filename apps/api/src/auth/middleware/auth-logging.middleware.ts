import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthActivity');

  use(req: Request, res: Response, next: NextFunction) {
    const isAuthenticated = req.isAuthenticated();
    const user = req.user;
    const route = req.path;
    const method = req.method;

    if (isAuthenticated && user) {
      this.logger.log(
        `[AUTHENTICATED] ${method} ${route} - User: ${user.username} (${user.id})`,
      );
    } else {
      this.logger.log(`[GUEST] ${method} ${route} - Unauthenticated request`);
    }

    if (!isAuthenticated && this.isProtectedRoute(route)) {
      this.logger.warn(
        `[UNAUTHORIZED] Unauthenticated access attempt to protected route: ${method} ${route}`,
      );
    }

    next();
  }

  private isProtectedRoute(route: string): boolean {
    const protectedPaths = ['/api/portfolios', '/api/auth/user'];
    return protectedPaths.some((path) => route.startsWith(path));
  }
}
