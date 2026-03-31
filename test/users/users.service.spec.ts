import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/modules/users/users.service';
import { PrismaService } from 'src/database/prisma.service';
import { UserMapper } from 'src/modules/users/mapper/users.mapper';
import { UserNotFoundException } from 'src/modules/users/exceptions/user-not-found-exception';
import { UserEmailAlreadyExistsException } from 'src/modules/users/exceptions/user-email-already-exists-exception';
import { PinoLogger } from 'nestjs-pino';
import { UserRoles } from 'generated/prisma/enums';

jest.mock('src/modules/users/mapper/users.mapper');

type MockPrisma = {
  user: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrisma;

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
    const prismaMock: MockPrisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PinoLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get(UsersService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      (UserMapper.toListResponseDto as jest.Mock).mockReturnValue({
        users: [mockUser],
      });

      const result = await service.getAll();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual({ users: [mockUser] });
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      (UserMapper.toResponseDto as jest.Mock).mockReturnValue(mockUser);

      const result = await service.getById('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getById('1')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('getByEmail', () => {
    it('should return user by email', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (UserMapper.toAuthDto as jest.Mock).mockReturnValue(mockUser);

      const result = await service.getByEmail('user@test.com');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.getByEmail('user@test.com')).rejects.toThrow(
        UserNotFoundException,
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
      });
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      (UserMapper.toPrismaCreate as jest.Mock).mockReturnValue({});
      (UserMapper.toResponseDto as jest.Mock).mockReturnValue(mockUser);

      const result = await service.create({
        name: 'User 1',
        email: 'user@test.com',
        password: '123456',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.create({
          name: 'User 1',
          email: 'user@test.com',
          password: '123456',
        }),
      ).rejects.toThrow(UserEmailAlreadyExistsException);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue(mockUser);

      (UserMapper.toPrismaUpdate as jest.Mock).mockReturnValue({});
      (UserMapper.toResponseDto as jest.Mock).mockReturnValue(mockUser);

      const result = await service.update('1', {
        name: 'Updated',
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', {})).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.update('1', { email: 'duplicate@test.com' }),
      ).rejects.toThrow(UserEmailAlreadyExistsException);
    });
  });

  describe('addRoles', () => {
    it('should add roles to user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        roles: [UserRoles.USER, UserRoles.ADMIN],
      });

      (UserMapper.toResponseDto as jest.Mock).mockReturnValue({
        ...mockUser,
        roles: [UserRoles.USER, UserRoles.ADMIN],
      });

      const result = await service.addRoles('1', [UserRoles.ADMIN]);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.roles).toContain(UserRoles.ADMIN);
    });
  });

  describe('removeRoles', () => {
    it('should remove roles from user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        roles: [UserRoles.USER, UserRoles.ADMIN],
      });

      prisma.user.update.mockResolvedValue({
        ...mockUser,
        roles: [UserRoles.USER],
      });

      (UserMapper.toResponseDto as jest.Mock).mockReturnValue({
        ...mockUser,
        roles: [UserRoles.USER],
      });

      const result = await service.removeRoles('1', [UserRoles.ADMIN]);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.roles).not.toContain(UserRoles.ADMIN);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      await service.delete('1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(UserNotFoundException);
    });
  });
});
