import { Injectable } from '@nestjs/common';
import { IUsersService } from './contracts/i-users-service';
import { PrismaService } from 'src/database/prisma.service';
import { PinoLogger } from 'nestjs-pino';

import { CreateUserDto } from './dtos/input/create-user-dto';
import { UpdateUserDto } from './dtos/input/update-user-dto';
import { UserMapper } from './mapper/users.mapper';
import { UserNotFoundException } from './exceptions/user-not-found-exception';
import { UserEmailAlreadyExistsException } from './exceptions/user-email-already-exists-exception';
import { User } from 'generated/prisma/client';
import { UsersListResponseDto } from './dtos/output/user-list-response-dto';
import { UserResponseDto } from './dtos/output/user-response-dto';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {}

  async getAll(): Promise<UsersListResponseDto> {
    const users: User[] = await this.prisma.user.findMany();

    const response = UserMapper.toListResponseDto(users);

    return response;
  }

  async getById(id: string) {
    const user = await this.findUserOrFail(id);

    const response = UserMapper.toResponseDto(user);

    return response;
  }

  async create(user: CreateUserDto): Promise<UserResponseDto> {
    this.logger.info({ user }, 'Iniciando criação de usuário.');

    const existingUser = await this.prisma.user.findFirst({
      where: { email: user.email },
    });

    if (existingUser) {
      this.logger.warn(
        { email: user.email },
        'Tentativa de criar usuário com email duplicado.',
      );

      throw new UserEmailAlreadyExistsException(
        'Já existe um usuário com esse email.',
      );
    }

    const userEntity = UserMapper.toPrismaCreate(user);

    const createdUser = await this.prisma.user.create({
      data: userEntity,
    });

    this.logger.info({ userId: createdUser.id }, 'Usuário criado com sucesso.');

    return UserMapper.toResponseDto(createdUser);
  }

  async update(id: string, user: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findUserOrFail(id);

    this.logger.info({ userId: id }, 'Atualizando usuário.');

    if (user.email) {
      const userWithSameEmail = await this.prisma.user.findFirst({
        where: {
          email: user.email,
          NOT: { id },
        },
      });

      if (userWithSameEmail) {
        this.logger.warn(
          { email: user.email },
          'Tentativa de atualizar usuário com email duplicado.',
        );

        throw new UserEmailAlreadyExistsException(
          'Já existe um usuário com esse email.',
        );
      }
    }

    const userEntity = UserMapper.toPrismaUpdate(user, existingUser);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userEntity,
    });

    this.logger.info({ userId: id }, 'Usuário atualizado com sucesso.');

    return UserMapper.toResponseDto(updatedUser);
  }

  async addRoles(id: string, roles: string[]): Promise<UserResponseDto> {
    const user = await this.findUserOrFail(id);

    this.logger.info({ userId: id, roles }, 'Adicionando roles ao usuário.');

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        roles: Array.from(new Set([...user.roles, ...roles])),
      },
    });

    return UserMapper.toResponseDto(updatedUser);
  }

  async removeRoles(id: string, roles: string[]): Promise<UserResponseDto> {
    const user = await this.findUserOrFail(id);

    this.logger.info({ userId: id, roles }, 'Removendo roles do usuário.');

    const updatedRoles = user.roles.filter((role) => !roles.includes(role));

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        roles: updatedRoles,
      },
    });

    return UserMapper.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.findUserOrFail(id);

    this.logger.info({ userId: id }, 'Deletando usuário.');

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.info({ userId: id }, 'Usuário deletado com sucesso.');
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user: User | null = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn({ userId: id }, 'Usuário não encontrado.');

      throw new UserNotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }
}
