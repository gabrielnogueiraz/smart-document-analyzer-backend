import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GroqService } from './groq.service';
import { CreateAnalysisDto } from '../dtos/create-analysis.dto';
import { AnalysisResponseDto } from '../dtos/analysis-response.dto';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groqService: GroqService,
  ) {}

  async createAnalysis(
    userId: string,
    createAnalysisDto: CreateAnalysisDto,
  ): Promise<AnalysisResponseDto> {
    const { documentId, groqApiKey, customPrompt } = createAnalysisDto;

    // Verificar se o documento existe e pertence ao usuário
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
      select: { id: true, extractedText: true, title: true },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (!document.extractedText) {
      throw new BadRequestException('Documento não possui texto extraído');
    }

    try {
      this.logger.log(`Iniciando análise do documento: ${documentId}`);

      // Analisar documento com Groq
      const analysisResult = await this.groqService.analyzeDocument(
        document.extractedText,
        groqApiKey,
        customPrompt,
      );

      // Salvar análise no banco (sem armazenar a API key)
      const analysis = await this.prisma.analysis.create({
        data: {
          documentId,
          userId,
          summary: analysisResult.summary,
          topics: analysisResult.topics,
          insights: analysisResult.insights,
          // Não armazenamos a API key por segurança
        },
      });

      this.logger.log(`Análise criada com sucesso: ${analysis.id}`);

      return analysis;
    } catch (error) {
      this.logger.error('Erro ao criar análise:', error);
      throw error;
    }
  }

  async findAllByUser(userId: string): Promise<AnalysisResponseDto[]> {
    const analyses = await this.prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return analyses;
  }

  async findAllByDocument(documentId: string, userId: string): Promise<AnalysisResponseDto[]> {
    // Verificar se o documento pertence ao usuário
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    const analyses = await this.prisma.analysis.findMany({
      where: { documentId, userId },
      orderBy: { createdAt: 'desc' },
    });

    return analyses;
  }

  async findById(id: string, userId: string): Promise<AnalysisResponseDto> {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, userId },
    });

    if (!analysis) {
      throw new NotFoundException('Análise não encontrada');
    }

    return analysis;
  }

  async delete(id: string, userId: string): Promise<void> {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, userId },
    });

    if (!analysis) {
      throw new NotFoundException('Análise não encontrada');
    }

    await this.prisma.analysis.delete({
      where: { id },
    });

    this.logger.log(`Análise deletada: ${id}`);
  }

  async getAnalysisStats(userId: string) {
    const [totalAnalyses, recentAnalyses, topTopics] = await Promise.all([
      this.prisma.analysis.count({
        where: { userId },
      }),
      this.prisma.analysis.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
          },
        },
      }),
      this.prisma.analysis.findMany({
        where: { userId },
        select: { topics: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Contar tópicos mais frequentes
    const topicCounts: Record<string, number> = {};
    topTopics.forEach(analysis => {
      analysis.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const mostFrequentTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    return {
      totalAnalyses,
      recentAnalyses,
      mostFrequentTopics,
    };
  }
}
