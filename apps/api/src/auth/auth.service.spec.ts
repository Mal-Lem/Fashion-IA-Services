import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

// ── Mocks ────────────────────────────────────────────────────
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-secret'),
};

const mockEventsService = {
  emit: jest.fn().mockResolvedValue(undefined),
};

// ── Tests ─────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  // ── register ────────────────────────────────────────────────
  describe('register', () => {
    const registerDto = {
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie@test.com',
      password: 'Test1234',
    };

    it('devrait créer un compte avec succès', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null); // Email pas encore pris
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-123',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'user',
        passwordHash: 'hashed',
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(mockEventsService.emit).toHaveBeenCalledWith(
        'user_registered',
        'user-123',
        expect.any(Object),
      );
    });

    it('devrait rejeter si l\'email est déjà utilisé', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('devrait normaliser l\'email en minuscules', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'marie@test.com',
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'user',
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Act
      await service.register({ ...registerDto, email: 'MARIE@TEST.COM' });

      // Assert
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'marie@test.com' }),
        }),
      );
    });
  });

  // ── validateUser ─────────────────────────────────────────────
  describe('validateUser', () => {
    it('devrait retourner null si l\'email n\'existe pas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('inconnu@test.com', 'password');

      expect(result).toBeNull();
    });

    it('devrait retourner null si le mot de passe est incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'marie@test.com',
        passwordHash: '$2b$12$invalidhash',
      });

      const result = await service.validateUser('marie@test.com', 'mauvais-mot-de-passe');

      expect(result).toBeNull();
    });
  });

  // ── login ─────────────────────────────────────────────────────
  describe('login', () => {
    it('devrait retourner un access token et un refresh token', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'marie@test.com',
        role: 'user',
        passwordHash: 'hash',
      };
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(20);
    });
  });

  // ── logout ─────────────────────────────────────────────────────
  describe('logout', () => {
    it('devrait révoquer le refresh token', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout('user-123', 'some-refresh-token');

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });
  });

  // ── requestPasswordReset ──────────────────────────────────────
  describe('requestPasswordReset', () => {
    it('devrait retourner un message neutre même si l\'email n\'existe pas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.requestPasswordReset('inconnu@test.com');

      expect(result.message).toContain('Si ce compte existe');
    });
  });
});