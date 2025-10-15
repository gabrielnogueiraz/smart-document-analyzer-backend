import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { PdfExtractionService } from './services/pdf-extraction.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 10485760), // 10MB
        },
        fileFilter: (req, file, callback) => {
          const allowedTypes = configService.get<string>('ALLOWED_FILE_TYPES', 'application/pdf');
          if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error('Tipo de arquivo não permitido. Apenas PDFs são aceitos.'), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, PdfExtractionService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
