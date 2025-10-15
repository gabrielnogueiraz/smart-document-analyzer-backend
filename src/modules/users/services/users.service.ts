import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Usuário atualizado: ${userId}`);

    return updatedUser;
  }

  async delete(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.log(`Usuário deletado: ${userId}`);
  }

  async getUserStats(userId: string) {
    const [documentCount, analysisCount] = await Promise.all([
      this.prisma.document.count({
        where: { userId },
      }),
      this.prisma.analysis.count({
        where: { userId },
      }),
    ]);

    return {
      documents: documentCount,
      analyses: analysisCount,
    };
  }
}
