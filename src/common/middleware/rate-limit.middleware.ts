import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos
  private readonly maxRequests = 100; // 100 requests por janela

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getClientKey(req);
    const now = Date.now();

    // Limpar entradas expiradas
    this.cleanExpiredEntries(now);

    const clientData = this.store[key] || { count: 0, resetTime: now + this.windowMs };

    if (now > clientData.resetTime) {
      // Resetar contador
      clientData.count = 0;
      clientData.resetTime = now + this.windowMs;
    }

    clientData.count++;

    if (clientData.count > this.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Muitas requisições. Tente novamente em alguns minutos.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.store[key] = clientData;

    // Adicionar headers de rate limit
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - clientData.count));
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());

    next();
  }

  private getClientKey(req: Request): string {
    // Usar IP + User-Agent para identificar clientes únicos
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}-${userAgent}`;
  }

  private cleanExpiredEntries(now: number): void {
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}
