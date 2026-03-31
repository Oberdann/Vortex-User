import { UserRoles } from 'generated/prisma/enums';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  roles: UserRoles[];
  createdAt: Date;
  updatedAt: Date;
}
