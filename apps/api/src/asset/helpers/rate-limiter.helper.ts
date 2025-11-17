import { Logger } from '@nestjs/common';

export interface RateLimiterConfig {
  maxRequestsPerMinute: number;
  rateWindowMs: number;
  minJitterMs?: number;
  maxJitterMs?: number;
}

/**
 * Helper class for managing API rate limiting
 */
export class RateLimiter {
  private readonly logger = new Logger(RateLimiter.name);
  private requestTimestamps: number[] = [];
  
  constructor(private readonly config: RateLimiterConfig) {}

  private get minDelayMs(): number {
    return Math.ceil(this.config.rateWindowMs / this.config.maxRequestsPerMinute);
  }

  async waitForRateLimit(): Promise<void> {
    this.cleanOldTimestamps();
    const now = Date.now();
    const requestsInLastMinute = this.requestTimestamps.length;
    const requestsRemaining = this.config.maxRequestsPerMinute - requestsInLastMinute;

    this.logger.verbose(
      `Rate limit check: ${requestsInLastMinute}/${this.config.maxRequestsPerMinute} requests used (${requestsRemaining} remaining)`,
    );

    if (requestsInLastMinute >= this.config.maxRequestsPerMinute) {
      const oldestRequest = this.requestTimestamps[0];
      const timeToWait = this.config.rateWindowMs - (now - oldestRequest);
      
      if (timeToWait > 0) {
        this.logger.warn(
          `Rate limit reached (${requestsInLastMinute}/${this.config.maxRequestsPerMinute} requests). Waiting ${(timeToWait / 1000).toFixed(1)}s...`,
        );
        await this.sleep(timeToWait + 1000);
        this.cleanOldTimestamps();
        this.logger.verbose(`Rate limit cooldown complete`);
      }
    }

    const delay = Math.max(
      this.minDelayMs,
      Math.ceil(this.config.rateWindowMs / this.config.maxRequestsPerMinute),
    );
    
    const jitterMin = this.config.minJitterMs ?? 0;
    const jitterMax = this.config.maxJitterMs ?? 0;
    const jitter = Math.random() * (jitterMax - jitterMin) + jitterMin;
    const totalDelay = delay + jitter;

    this.logger.verbose(
      `Applying delay: ${(delay / 1000).toFixed(2)}s + jitter ${(jitter / 1000).toFixed(2)}s = ${(totalDelay / 1000).toFixed(2)}s`,
    );

    await this.sleep(totalDelay);
  }

  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
    this.cleanOldTimestamps();
    const requestsInWindow = this.requestTimestamps.length;
    const requestsRemaining = this.config.maxRequestsPerMinute - requestsInWindow;
    
    this.logger.verbose(
      `Request recorded: ${requestsInWindow}/${this.config.maxRequestsPerMinute} (${requestsRemaining} remaining)`,
    );
  }

  private cleanOldTimestamps(): void {
    const now = Date.now();
    const cutoff = now - this.config.rateWindowMs;
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > cutoff);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStats() {
    this.cleanOldTimestamps();
    return {
      requestsInWindow: this.requestTimestamps.length,
      maxRequests: this.config.maxRequestsPerMinute,
      windowMs: this.config.rateWindowMs,
    };
  }
}

