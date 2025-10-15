import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import { Readable } from 'stream';

@Injectable()
export class PdfExtractionService {
  private readonly logger = new Logger(PdfExtractionService.name);

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      this.logger.log('Iniciando extração de texto do PDF');

      const data = await pdf(buffer, {
        // Configurações para otimizar a extração
        max: 0, // Sem limite de páginas
        version: 'v1.10.100', // Versão específica do pdf-parse
      });

      if (!data || !data.text) {
        throw new BadRequestException('Não foi possível extrair texto do PDF');
      }

      // Limpar e normalizar o texto
      const cleanedText = this.cleanExtractedText(data.text);
      
      if (cleanedText.length === 0) {
        throw new BadRequestException('PDF não contém texto extraível');
      }

      this.logger.log(`Texto extraído com sucesso: ${cleanedText.length} caracteres`);

      return cleanedText;
    } catch (error) {
      this.logger.error('Erro ao extrair texto do PDF:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Erro ao processar o arquivo PDF');
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalizar quebras de linha
      .replace(/\n{3,}/g, '\n\n') // Limitar múltiplas quebras de linha
      .replace(/[ \t]+/g, ' ') // Normalizar espaços
      .trim(); // Remover espaços no início e fim
  }

  async validatePdfBuffer(buffer: Buffer): Promise<boolean> {
    // Verificar se o buffer começa com o cabeçalho PDF
    const pdfHeader = buffer.toString('ascii', 0, 4);
    return pdfHeader === '%PDF';
  }

  async getPdfInfo(buffer: Buffer): Promise<{ pages: number; info: any }> {
    try {
      const data = await pdf(buffer, {
        max: 0,
        version: 'v1.10.100',
      });

      return {
        pages: data.numpages,
        info: data.info,
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações do PDF:', error);
      throw new BadRequestException('Erro ao obter informações do PDF');
    }
  }
}
