import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Título do documento',
    example: 'Machine Learning in Healthcare',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title?: string;
}
