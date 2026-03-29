import { Prisma, User } from 'generated/prisma/client';
import { CreateUserDto } from '../dtos/input/create-user-dto';
import { UpdateUserDto } from '../dtos/input/update-user-dto';
import { UserResponseDto } from '../dtos/output/user-response-dto';
import { UserAuthResponseDto } from '../dtos/output/user-auth-response-dto';

export class UserMapper {
  static toResponseDto(this: void, user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user?.roles ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toListResponseDto = (users: User[]) => ({
    users: users.map(UserMapper.toResponseDto),
  });

  static toAuthDto(user: User): UserAuthResponseDto {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      roles: user.roles ?? [],
    };
  }

  static toPrismaCreate(createDto: CreateUserDto) {
    return {
      name: createDto.name,
      email: createDto.email,
      password: createDto.password,
      roles: [],
    };
  }

  static toPrismaUpdate(
    updateDto: UpdateUserDto,
    existingUser: User,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {
      name: updateDto.name ?? existingUser.name,
      email: updateDto.email ?? existingUser.email,
      password: updateDto.password ?? existingUser.password,
    };

    return data;
  }
}
