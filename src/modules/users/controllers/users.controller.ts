import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Obter perfil do usuário',
    description: 'Retorna os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário obtido com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description: 'Atualiza os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar conta do usuário',
    description: 'Remove permanentemente a conta do usuário e todos os dados associados',
  })
  @ApiResponse({
    status: 204,
    description: 'Conta deletada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async deleteProfile(@CurrentUser() user: any): Promise<void> {
    return this.usersService.delete(user.id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas do usuário',
    description: 'Retorna estatísticas sobre documentos e análises do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas obtidas com sucesso',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'number',
          description: 'Número total de documentos',
        },
        analyses: {
          type: 'number',
          description: 'Número total de análises',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getStats(@CurrentUser() user: any) {
    return this.usersService.getUserStats(user.id);
  }
}
