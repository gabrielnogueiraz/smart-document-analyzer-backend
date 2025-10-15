import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { DocumentsService } from '../services/documents.service';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { DocumentResponseDto } from '../dtos/document-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CuidValidationPipe } from '../../../common/pipes/cuid-validation.pipe';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de documento PDF',
    description: 'Faz upload de um documento PDF e extrai seu texto',
  })
  @ApiResponse({
    status: 201,
    description: 'Documento uploadado com sucesso',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido ou erro no processamento',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new Error('Arquivo é obrigatório');
    }

    return this.documentsService.uploadDocument(user.id, file, uploadDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar documentos do usuário',
    description: 'Retorna todos os documentos do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos obtida com sucesso',
    type: [DocumentResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async findAll(@CurrentUser() user: any): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter documento por ID',
    description: 'Retorna um documento específico do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento obtido com sucesso',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', CuidValidationPipe) id: string,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.findById(id, user.id);
  }

  @Get(':id/text')
  @ApiOperation({
    summary: 'Obter texto extraído do documento',
    description: 'Retorna o texto extraído do PDF',
  })
  @ApiResponse({
    status: 200,
    description: 'Texto obtido com sucesso',
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Texto extraído do PDF',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado',
  })
  async getText(
    @CurrentUser() user: any,
    @Param('id', CuidValidationPipe) id: string,
  ): Promise<{ text: string }> {
    return this.documentsService.getDocumentText(id, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Obter estatísticas do documento',
    description: 'Retorna estatísticas sobre o documento e suas análises',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas obtidas com sucesso',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            filename: { type: 'string' },
            fileSize: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        textLength: { type: 'number' },
        analysisCount: { type: 'number' },
        lastAnalysis: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado',
  })
  async getStats(
    @CurrentUser() user: any,
    @Param('id', CuidValidationPipe) id: string,
  ) {
    return this.documentsService.getDocumentStats(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar documento',
    description: 'Remove um documento e todas as análises associadas',
  })
  @ApiResponse({
    status: 204,
    description: 'Documento deletado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado',
  })
  async remove(
    @CurrentUser() user: any,
    @Param('id', CuidValidationPipe) id: string,
  ): Promise<void> {
    return this.documentsService.delete(id, user.id);
  }
}
