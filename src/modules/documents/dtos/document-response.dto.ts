import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'ID único do documento',
    example: 'clx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Título do documento',
    example: 'Machine Learning in Healthcare',
  })
  title: string;

  @ApiProperty({
    description: 'Nome do arquivo original',
    example: 'ml-healthcare.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1048576,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Tipo MIME do arquivo',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Texto extraído do PDF',
    example: 'Este documento discute...',
    nullable: true,
  })
  extractedText: string | null;

  @ApiProperty({
    description: 'ID do usuário proprietário',
    example: 'clx123456789',
  })
  userId: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
