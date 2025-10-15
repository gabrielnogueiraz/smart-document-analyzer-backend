import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestSizeMiddleware implements NestMiddleware {
  private readonly maxSize = 10 * 1024 * 1024; // 10MB

  use(req: Request, res: Response, next: NextFunction) {
    const contentLength = parseInt(req.get('content-length') || '0', 10);

    if (contentLength > this.maxSize) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          message: 'Tamanho da requisição excede o limite permitido (10MB)',
          error: 'Payload Too Large',
        },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    next();
  }
}
