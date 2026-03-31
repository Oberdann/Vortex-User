import { Test, TestingModule } from '@nestjs/testing';
import { UserRoles } from 'generated/prisma/enums';
import { IUsersService } from 'src/modules/users/contracts/i-users-service';
import { CreateUserDto } from 'src/modules/users/dtos/input/create-user-dto';
import { UpdateUserDto } from 'src/modules/users/dtos/input/update-user-dto';
import { UsersController } from 'src/modules/users/users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<IUsersService>;

  const mockUser = {
    id: '1',
    name: 'User 1',
    email: 'user@test.com',
    password: 'hashed-password',
    roles: [UserRoles.USER],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<IUsersService> = {
      getAll: jest.fn(),
      getById: jest.fn(),
      getByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      addRoles: jest.fn(),
      removeRoles: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: 'IUsersService',
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get('IUsersService');
  });

  describe('getAll', () => {
    it('should return users with success message', async () => {
      service.getAll.mockResolvedValue({
        users: [mockUser],
      });

      const result = await controller.getAll();

      expect(service.getAll).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Usuários encontrados com sucesso.',
        data: { users: [mockUser] },
        success: true,
      });
    });
  });

  describe('getById', () => {
    it('should return a user', async () => {
      service.getById.mockResolvedValue(mockUser);

      const result = await controller.getById('1');

      expect(service.getById).toHaveBeenCalledWith('1');

      expect(result).toEqual({
        message: 'Usuário encontrado com sucesso.',
        data: mockUser,
        success: true,
      });
    });
  });

  describe('getByEmail', () => {
    it('should return a user when found', async () => {
      service.getByEmail.mockResolvedValue(mockUser);

      const result = await controller.getByEmail('user@test.com');

      expect(service.getByEmail).toHaveBeenCalledWith('user@test.com');
      expect(result).toEqual({
        message: 'Usuário encontrado com sucesso.',
        data: mockUser,
        success: true,
      });
    });

    it('should throw if user not found', async () => {
      service.getByEmail.mockRejectedValue(
        new Error('Usuário não encontrado.'),
      );

      await expect(controller.getByEmail('notfound@test.com')).rejects.toThrow(
        'Usuário não encontrado.',
      );

      expect(service.getByEmail).toHaveBeenCalledWith('notfound@test.com');
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        name: 'User 1',
        email: 'user@test.com',
        password: '123456',
      };

      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);

      expect(result).toEqual({
        message: 'Usuário criado com sucesso.',
        data: mockUser,
        success: true,
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated',
      };

      service.update.mockResolvedValue(mockUser);

      const result = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith('1', dto);

      expect(result).toEqual({
        message: 'Usuário atualizado com sucesso.',
        data: mockUser,
        success: true,
      });
    });
  });

  describe('addRoles', () => {
    it('should add roles to user', async () => {
      const dto = { roles: [UserRoles.ADMIN] };

      service.addRoles.mockResolvedValue(mockUser);

      const result = await controller.addRoles('1', dto);

      expect(service.addRoles).toHaveBeenCalledWith('1', dto.roles);

      expect(result).toEqual({
        message: 'Roles adicionadas com sucesso.',
        data: mockUser,
        success: true,
      });
    });
  });

  describe('removeRoles', () => {
    it('should remove roles from user', async () => {
      const dto = { roles: [UserRoles.ADMIN] };

      service.removeRoles.mockResolvedValue(mockUser);

      const result = await controller.removeRoles('1', dto);

      expect(service.removeRoles).toHaveBeenCalledWith('1', dto.roles);

      expect(result).toEqual({
        message: 'Roles removidas com sucesso.',
        data: mockUser,
        success: true,
      });
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith('1');

      expect(result).toEqual({
        message: 'Usuário deletado com sucesso.',
        data: [],
        success: true,
      });
    });
  });
});
