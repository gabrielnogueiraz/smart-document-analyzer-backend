import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'clx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
