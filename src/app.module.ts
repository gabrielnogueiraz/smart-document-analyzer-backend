import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { RequestSizeMiddleware } from './common/middleware/request-size.middleware';
import { HealthController } from './common/controllers/health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60) * 1000,
          limit: configService.get('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),

    // Health checks
    TerminusModule,

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    DocumentsModule,
    AnalysisModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware, RequestSizeMiddleware)
      .forRoutes('*');
  }
}
