import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalysisDto {
  @ApiProperty({
    description: 'ID do documento a ser analisado',
    example: 'cmgsb0p950001unv9vjud4yn7',
  })
  @IsString({ message: 'ID do documento deve ser uma string válida' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'ID do documento deve ser um ID válido do sistema' })
  documentId: string;

  @ApiProperty({
    description: 'Chave da API Groq fornecida pelo usuário',
    example: 'gsk_1234567890abcdef...',
  })
  @IsString()
  @MaxLength(200, { message: 'Chave da API deve ter no máximo 200 caracteres' })
  groqApiKey: string;

  @ApiProperty({
    description: 'Prompt personalizado para análise (opcional)',
    example: 'Analise este documento focando em aspectos de segurança',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Prompt personalizado deve ter no máximo 1000 caracteres' })
  customPrompt?: string;
}
