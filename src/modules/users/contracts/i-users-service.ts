import { UserRoles } from 'generated/prisma/enums';
import { CreateUserDto } from '../dtos/input/create-user-dto';
import { UpdateUserDto } from '../dtos/input/update-user-dto';
import { UserAuthResponseDto } from '../dtos/output/user-auth-response-dto';
import { UsersListResponseDto } from '../dtos/output/user-list-response-dto';
import { UserResponseDto } from '../dtos/output/user-response-dto';

export interface IUsersService {
  getAll(): Promise<UsersListResponseDto>;
  getById(id: string): Promise<UserResponseDto>;
  getByEmail(email: string): Promise<UserAuthResponseDto>;
  create(user: CreateUserDto): Promise<UserResponseDto>;
  update(id: string, user: UpdateUserDto): Promise<UserResponseDto>;
  addRoles(id: string, roles: UserRoles[]): Promise<UserResponseDto>;
  removeRoles(id: string, roles: UserRoles[]): Promise<UserResponseDto>;
  delete(id: string): Promise<void>;
}
