import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = jest.requireMock('bcryptjs') as {
  hash: jest.Mock;
  compare: jest.Mock;
};

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwt = {
    sign: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as any, jwt as any);
  });

  it('register hashes password and lowercases email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue('hashed-value');
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      firstName: 'User',
      lastName: 'Test',
      phone: null,
    });
    jwt.sign.mockReturnValue('token');

    const result = await service.register({
      email: 'User@Test.com',
      password: 'Secret123!',
      firstName: 'User',
      lastName: 'Test',
      phone: '',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'user@test.com',
          passwordHash: 'hashed-value',
        }),
      }),
    );
    expect(result.accessToken).toBe('token');
  });

  it('register rejects duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'exists' });

    await expect(
      service.register({
        email: 'user@test.com',
        password: 'Secret123!',
        firstName: 'User',
        lastName: 'Test',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login rejects invalid password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      firstName: 'User',
      lastName: 'Test',
      passwordHash: 'hash',
    });
    bcryptMock.compare.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@test.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
