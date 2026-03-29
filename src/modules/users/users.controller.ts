import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { IUsersService } from './contracts/i-users-service';
import { Ok } from 'src/common/utils/response-util';
import { CreateUserDto } from './dtos/input/create-user-dto';
import { UpdateUserDto } from './dtos/input/update-user-dto';
import { AddUserRolesDto } from './dtos/input/add-user-roles-dto';
import { RemoveUserRolesDto } from './dtos/input/remove-user-roles-dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('IUsersService')
    private readonly usersService: IUsersService,
  ) {}

  @HttpCode(200)
  @Get()
  async getAll() {
    const response = await this.usersService.getAll();

    const message =
      response.users.length <= 0
        ? 'Nenhum usuário encontrado.'
        : 'Usuários encontrados com sucesso.';

    return Ok(message, response);
  }

  @HttpCode(200)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = await this.usersService.getById(id);

    return Ok('Usuário encontrado com sucesso.', response);
  }

  @HttpCode(200)
  @Get('by-email/:email')
  async getByEmail(@Param('email') email: string) {
    const response = await this.usersService.getByEmail(email);

    return Ok('Usuário encontrado com sucesso.', response);
  }

  @HttpCode(201)
  @Post()
  async create(@Body() user: CreateUserDto) {
    const response = await this.usersService.create(user);

    return Ok('Usuário criado com sucesso.', response);
  }

  @HttpCode(200)
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    const response = await this.usersService.update(id, user);

    return Ok('Usuário atualizado com sucesso.', response);
  }

  @HttpCode(200)
  @Put(':id/roles/add')
  async addRoles(@Param('id') id: string, @Body() body: AddUserRolesDto) {
    const response = await this.usersService.addRoles(id, body.roles);

    return Ok('Roles adicionadas com sucesso.', response);
  }

  @HttpCode(200)
  @Put(':id/roles/remove')
  async removeRoles(@Param('id') id: string, @Body() body: RemoveUserRolesDto) {
    const response = await this.usersService.removeRoles(id, body.roles);

    return Ok('Roles removidas com sucesso.', response);
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);

    return Ok('Usuário deletado com sucesso.');
  }
}
