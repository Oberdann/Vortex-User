import { BaseVortexCommerceException } from 'src/common/exceptions/base-vortex-commerce-exception';

export class UserEmailAlreadyExistsException extends BaseVortexCommerceException {
  constructor(message: string, code: number = 404) {
    super(message, code);
  }
}
