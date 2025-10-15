import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário já existe com este email',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login',
    description: 'Autentica um usuário e retorna tokens de acesso',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Renovar token de acesso',
    description: 'Gera um novo token de acesso usando o refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Novo token de acesso JWT',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresh inválido',
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
