import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('UserContext');

  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated() && req.user) {
      try {
        const fullUser = await this.prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            portfolios: {
              select: { id: true },
            },
          },
        });

        if (fullUser) {
          req.user.portfolioCount = fullUser.portfolios.length;
          req.user.lastFetched = new Date();

          this.logger.debug(
            `User context enriched: ${fullUser.username} (${fullUser.portfolios.length} portfolios)`,
          );
        }
      } catch (error) {
        this.logger.error('Failed to enrich user context:', error);
      }
    }

    next();
  }
}
