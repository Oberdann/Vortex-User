import { UserRoles } from 'generated/prisma/enums';

export interface UserAuthResponseDto {
  id: string;
  email: string;
  password: string;
  roles: UserRoles[];
}
