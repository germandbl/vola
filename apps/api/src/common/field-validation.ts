import { BadRequestException } from '@nestjs/common';

// Mismo formato que ZodValidationPipe, para que la pantalla muestre el error debajo del campo.
export function createFieldValidationException(
  field: string,
  message: string,
): BadRequestException {
  return new BadRequestException({
    message: 'Request body is invalid',
    issues: [{ path: [field], message }],
  });
}
