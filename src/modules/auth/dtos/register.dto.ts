import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(50, { message: 'Senha deve ter no máximo 50 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Nome do usuário (opcional)',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;
}
