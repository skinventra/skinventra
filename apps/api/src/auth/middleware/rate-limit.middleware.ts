import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
  firstAttempt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RateLimit');
  private attempts = new Map<string, RateLimitRecord>();
  private readonly maxAttempts = 100;
  private readonly windowMs = 60000; // 1 minute

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = this.attempts.get(ip);

    if (record) {
      if (now > record.resetAt) {
        this.attempts.delete(ip);
        this.createNewRecord(ip, now);
      } else if (record.count >= this.maxAttempts) {
        const timeLeft = Math.ceil((record.resetAt - now) / 1000);
        this.logger.warn(
          `Rate limit exceeded for IP: ${ip} - ${record.count} requests`,
        );
        return res.status(429).json({
          message: 'Too many requests',
          retryAfter: timeLeft,
        });
      } else {
        record.count++;
      }
    } else {
      this.createNewRecord(ip, now);
    }

    next();
  }

  private createNewRecord(ip: string, now: number): void {
    this.attempts.set(ip, {
      count: 1,
      resetAt: now + this.windowMs,
      firstAttempt: now,
    });
  }

  clearOldRecords(): void {
    const now = Date.now();
    for (const [ip, record] of this.attempts.entries()) {
      if (now > record.resetAt) {
        this.attempts.delete(ip);
      }
    }
  }
}
