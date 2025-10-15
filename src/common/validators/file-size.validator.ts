import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidFileSize', async: false })
export class IsValidFileSizeConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File, args: ValidationArguments) {
    if (!file) {
      return false;
    }

    const maxSize = args.constraints[0] || 10 * 1024 * 1024; // 10MB padrão
    return file.size <= maxSize;
  }

  defaultMessage(args: ValidationArguments) {
    const maxSize = args.constraints[0] || 10 * 1024 * 1024;
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `Tamanho do arquivo excede o limite de ${maxSizeMB}MB`;
  }
}

export function IsValidFileSize(
  maxSize: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxSize],
      validator: IsValidFileSizeConstraint,
    });
  };
}
