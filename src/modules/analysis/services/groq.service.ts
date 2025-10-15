import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface GroqAnalysisResult {
  summary: string;
  topics: string[];
  insights?: string;
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.axiosInstance = axios.create({
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para retry automático
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 429 || error.response?.status >= 500) {
          this.logger.warn(`Erro ${error.response.status}, tentando novamente...`);
          await this.delay(2000);
          return this.axiosInstance.request(error.config);
        }
        throw error;
      },
    );
  }

  async analyzeDocument(
    text: string,
    groqApiKey: string,
    customPrompt?: string,
  ): Promise<GroqAnalysisResult> {
    try {
      this.logger.log('Iniciando análise com Groq API');
      this.logger.log(`URL da API: ${this.configService.get<string>('GROQ_API_URL')}`);
      this.logger.log(`Modelo: ${this.configService.get<string>('GROQ_MODEL', 'llama-3-8b-8192')}`);
      this.logger.log(`Chave API (primeiros 10 chars): ${groqApiKey.substring(0, 10)}...`);

      // Limitar tamanho do texto para evitar limites da API
      const limitedText = this.limitTextLength(text, 8000);
      this.logger.log(`Texto original: ${text.length} caracteres`);
      this.logger.log(`Texto limitado: ${limitedText.length} caracteres`);

      const prompt = this.buildAnalysisPrompt(limitedText, customPrompt);
      this.logger.log(`Prompt gerado: ${prompt.length} caracteres`);

      const response = await this.axiosInstance.post(
        this.configService.get<string>('GROQ_API_URL'),
        {
          model: this.configService.get<string>('GROQ_MODEL', 'llama-3-8b-8192'),
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de documentos acadêmicos. Analise o texto fornecido e retorne um JSON estruturado com resumo, tópicos e insights.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
          },
        },
      );

      const analysisResult = this.parseGroqResponse(response.data);
      this.logger.log('Análise concluída com sucesso');

      return analysisResult;
    } catch (error) {
      this.logger.error('Erro na análise com Groq:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new BadRequestException('Chave da API Groq inválida');
        }
        if (error.response?.status === 429) {
          throw new BadRequestException('Limite de taxa da API Groq excedido. Tente novamente em alguns minutos.');
        }
        if (error.response?.status === 400) {
          throw new BadRequestException('Solicitação inválida para a API Groq');
        }
      }

      throw new BadRequestException('Erro ao processar análise com IA');
    }
  }

  private buildAnalysisPrompt(text: string, customPrompt?: string): string {
    const basePrompt = `
Analise o seguinte documento acadêmico e retorne um JSON estruturado com:

1. **summary**: Um resumo conciso e acadêmico do documento (máximo 300 palavras)
2. **topics**: Uma lista de 5-10 tópicos principais e palavras-chave relevantes
3. **insights**: Insights adicionais sobre o documento (opcional, máximo 200 palavras)

Formato de resposta esperado:
{
  "summary": "Resumo do documento...",
  "topics": ["tópico1", "tópico2", "tópico3"],
  "insights": "Insights adicionais..."
}

${customPrompt ? `\nInstruções adicionais: ${customPrompt}\n` : ''}

Documento para análise:
${text}
`;

    return basePrompt.trim();
  }

  private parseGroqResponse(response: any): GroqAnalysisResult {
    try {
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da API Groq');
      }

      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da API Groq');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validar estrutura da resposta
      if (!parsed.summary || !parsed.topics || !Array.isArray(parsed.topics)) {
        throw new Error('Estrutura de resposta inválida da API Groq');
      }

      return {
        summary: parsed.summary,
        topics: parsed.topics,
        insights: parsed.insights || null,
      };
    } catch (error) {
      this.logger.error('Erro ao processar resposta da API Groq:', error);
      throw new BadRequestException('Erro ao processar resposta da IA');
    }
  }

  private limitTextLength(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Tentar cortar em uma quebra de parágrafo próxima
    const truncated = text.substring(0, maxLength);
    const lastParagraph = truncated.lastIndexOf('\n\n');
    
    if (lastParagraph > maxLength * 0.8) {
      return truncated.substring(0, lastParagraph);
    }

    return truncated + '...';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
