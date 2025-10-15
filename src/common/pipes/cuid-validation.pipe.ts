import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CuidValidationPipe implements PipeTransform {
  transform(value: string): string {
    // Validar se é um cuid válido (começa com 'c' seguido de 24 caracteres alfanuméricos)
    const cuidRegex = /^c[a-z0-9]{24}$/;
    
    if (!cuidRegex.test(value)) {
      throw new BadRequestException('ID deve ser um identificador válido do sistema');
    }
    
    return value;
  }
}
