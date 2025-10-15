import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;
}
