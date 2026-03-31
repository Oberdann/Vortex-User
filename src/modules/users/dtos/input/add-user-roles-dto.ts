import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';
import { UserRoles } from 'generated/prisma/enums';

export class AddUserRolesDto {
  @IsArray({ message: 'O campo [roles] deve ser um array.' })
  @ArrayNotEmpty({ message: 'O campo [roles] não pode estar vazio.' })
  @IsString({ each: true, message: 'Cada role deve ser uma string.' })
  roles: UserRoles[];
}
