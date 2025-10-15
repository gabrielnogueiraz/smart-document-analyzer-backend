import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidFileType', async: false })
export class IsValidFileTypeConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File, args: ValidationArguments) {
    if (!file) {
      return false;
    }

    const allowedTypes = args.constraints[0] || ['application/pdf'];
    return allowedTypes.includes(file.mimetype);
  }

  defaultMessage(args: ValidationArguments) {
    const allowedTypes = args.constraints[0] || ['application/pdf'];
    return `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`;
  }
}

export function IsValidFileType(
  allowedTypes: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [allowedTypes],
      validator: IsValidFileTypeConstraint,
    });
  };
}
