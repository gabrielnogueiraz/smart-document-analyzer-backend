import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AnalysisService } from '../services/analysis.service';
import { CreateAnalysisDto } from '../dtos/create-analysis.dto';
import { AnalysisResponseDto } from '../dtos/analysis-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CuidValidationPipe } from '../../../common/pipes/cuid-validation.pipe';

@ApiTags('analysis')
@Controller('analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova análise de documento',
    description: 'Analisa um documento usando IA (Groq) e retorna resumo, tópicos e insights',
  })
  @ApiResponse({
    status: 201,
    description: 'Análise criada com sucesso',
    type: AnalysisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na análise',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado',
  })
  async createAnalysis(
    @CurrentUser() user: any,
    @Body() createAnalysisDto: CreateAnalysisDto,
  ): Promise<AnalysisResponseDto> {
    return this.analysisService.createAnalysis(user.id, createAnalysisDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar análises do usuário',
    description: 'Retorna todas as análises do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análises obtida com sucesso',
    type: [AnalysisResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async findAll(@CurrentUser() user: any): Promise<AnalysisResponseDto[]> {
    return this.analysisService.findAllByUser(user.id);
  }

  @Get('document/:documentId')
  @ApiOperation({
    summary: 'Listar análises de um documento',
    description: 'Retorna todas as análises de um documento específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análises do documento obtida com sucesso',
    type: [AnalysisResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado',
  })
  async findByDocument(
    @CurrentUser() user: any,
    @Param('documentId', CuidValidationPipe) documentId: string,
  ): Promise<AnalysisResponseDto[]> {
    return this.analysisService.findAllByDocument(documentId, user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter análise por ID',
    description: 'Retorna uma análise específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Análise obtida com sucesso',
    type: AnalysisResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Análise não encontrada',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', CuidValidationPipe) id: string,
  ): Promise<AnalysisResponseDto> {
    return this.analysisService.findById(id, user.id);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'Obter estatísticas de análises',
    description: 'Retorna estatísticas sobre as análises do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas obtidas com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalAnalyses: {
          type: 'number',
          description: 'Total de análises realizadas',
        },
        recentAnalyses: {
          type: 'number',
          description: 'Análises dos últimos 7 dias',
        },
        mostFrequentTopics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              topic: { type: 'string' },
              count: { type: 'number' },
            },
          },
          description: 'Tópicos mais frequentes',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getStats(@CurrentUser() user: any) {
    return this.analysisService.getAnalysisStats(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar análise',
    description: 'Remove uma análise específica',
  })
  @ApiResponse({
    status: 204,
    description: 'Análise deletada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Análise não encontrada',
  })
  async remove(
    @CurrentUser() user: any,
    @Param('id', CuidValidationPipe) id: string,
  ): Promise<void> {
    return this.analysisService.delete(id, user.id);
  }
}
