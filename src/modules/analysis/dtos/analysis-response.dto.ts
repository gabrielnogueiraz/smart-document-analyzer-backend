import { ApiProperty } from '@nestjs/swagger';

export class AnalysisResponseDto {
  @ApiProperty({
    description: 'ID único da análise',
    example: 'clx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'ID do documento analisado',
    example: 'clx123456789',
  })
  documentId: string;

  @ApiProperty({
    description: 'ID do usuário que solicitou a análise',
    example: 'clx123456789',
  })
  userId: string;

  @ApiProperty({
    description: 'Resumo do documento',
    example: 'Este documento apresenta uma análise abrangente sobre...',
  })
  summary: string;

  @ApiProperty({
    description: 'Lista de tópicos e palavras-chave identificados',
    example: ['machine learning', 'healthcare', 'algorithms', 'data analysis'],
    type: [String],
  })
  topics: string[];

  @ApiProperty({
    description: 'Insights adicionais sobre o documento',
    example: 'Este documento foca principalmente em aplicações práticas...',
    nullable: true,
  })
  insights: string | null;

  @ApiProperty({
    description: 'Data de criação da análise',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
