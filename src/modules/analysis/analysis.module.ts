import { Module } from '@nestjs/common';
import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisService } from './services/analysis.service';
import { GroqService } from './services/groq.service';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, GroqService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
