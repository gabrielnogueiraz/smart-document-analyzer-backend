import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PdfExtractionService } from './pdf-extraction.service';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { DocumentResponseDto } from '../dtos/document-response.dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfExtractionService: PdfExtractionService,
  ) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
  ): Promise<DocumentResponseDto> {
    try {
      // Validar se é um PDF válido
      const isValidPdf = await this.pdfExtractionService.validatePdfBuffer(file.buffer);
      if (!isValidPdf) {
        throw new BadRequestException('Arquivo não é um PDF válido');
      }

      // Extrair texto do PDF
      const extractedText = await this.pdfExtractionService.extractTextFromBuffer(file.buffer);

      // Gerar título se não fornecido
      const title = uploadDto.title || this.generateTitleFromFilename(file.originalname);

      // Salvar documento no banco
      const document = await this.prisma.document.create({
        data: {
          title,
          filename: file.originalname,
          filePath: file.path || '', // Multer pode não definir path em memória
          fileSize: file.size,
          mimeType: file.mimetype,
          extractedText,
          userId,
        },
      });

      this.logger.log(`Documento uploadado com sucesso: ${document.id}`);

      return document;
    } catch (error) {
      this.logger.error('Erro ao fazer upload do documento:', error);
      throw error;
    }
  }

  async findAllByUser(userId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  async findById(id: string, userId: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return document;
  }

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.prisma.document.delete({
      where: { id },
    });

    this.logger.log(`Documento deletado: ${id}`);
  }

  async getDocumentText(id: string, userId: string): Promise<{ text: string }> {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
      select: { extractedText: true },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (!document.extractedText) {
      throw new BadRequestException('Texto não disponível para este documento');
    }

    return { text: document.extractedText };
  }

  async getDocumentStats(id: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
      include: {
        analyses: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return {
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        fileSize: document.fileSize,
        createdAt: document.createdAt,
      },
      textLength: document.extractedText?.length || 0,
      analysisCount: document.analyses.length,
      lastAnalysis: document.analyses[0]?.createdAt || null,
    };
  }

  private generateTitleFromFilename(filename: string): string {
    // Remover extensão e capitalizar
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
