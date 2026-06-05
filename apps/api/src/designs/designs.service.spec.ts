import { Test, TestingModule } from '@nestjs/testing';
import { DesignsService } from './designs.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';
import { CacheService } from '../cache/cache.service';
import { StorageService } from '../storage/storage.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  user: { findUnique: jest.fn(), update: jest.fn() },
  design: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockConfigService = {
  get: jest.fn().mockReturnValue(null),
};

const mockEventsService = {
  emit: jest.fn().mockResolvedValue(undefined),
};

const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
  getOrSet: jest.fn().mockImplementation((key, fn) => fn()),
};

const mockStorageService = {
  uploadImage: jest.fn().mockResolvedValue('http://localhost:9000/fap-designs/test.jpg'),
};

describe('DesignsService', () => {
  let service: DesignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventsService, useValue: mockEventsService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DesignsService>(DesignsService);
    jest.clearAllMocks();
  });

  // ── generate ──────────────────────────────────────────────────
  describe('generate', () => {
    const mockUser = {
      id: 'user-123',
      subscriptionStatus: 'free',
      aiCredits: 0,
      monthlyGenerationsUsed: 0,
    };

    const mockDto = {
      mode: 'guided' as const,
      type: 'robe',
      style: 'boheme',
      colors: [{ hex: '#FF69B4', name: 'Rose' }],
      fabric: 'soie',
      occasion: 'mariage',
    };

    it('devrait générer un design avec succès', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.design.create.mockResolvedValue({
        id: 'design-123',
        generatedImages: [
          'https://placehold.co/512x512/7C3AED/white?text=Design+1',
          'https://placehold.co/512x512/7C3AED/white?text=Design+2',
          'https://placehold.co/512x512/7C3AED/white?text=Design+3',
          'https://placehold.co/512x512/7C3AED/white?text=Design+4',
        ],
        expiresAt: new Date(),
      });

      // Act
      const result = await service.generate('user-123', mockDto);

      // Assert
      expect(result.designId).toBe('design-123');
      expect(result.images).toHaveLength(4);
      expect(mockPrismaService.design.create).toHaveBeenCalledTimes(1);
      expect(mockEventsService.emit).toHaveBeenCalledWith(
        'design_generated',
        'user-123',
        expect.any(Object),
      );
    });

    it('devrait bloquer si le quota est atteint', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        monthlyGenerationsUsed: 5, // Quota atteint
      });

      // Act
      const result = await service.generate('user-123', mockDto);

      // Assert
      expect(result.error).toBe('QUOTA_EXCEEDED');
      expect(mockPrismaService.design.create).not.toHaveBeenCalled();
    });

    it('devrait permettre la génération si l\'utilisateur est Premium', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        subscriptionStatus: 'premium',
        monthlyGenerationsUsed: 100, // Dépasserait le quota gratuit
      });
      mockPrismaService.design.create.mockResolvedValue({
        id: 'design-456',
        generatedImages: ['url1', 'url2', 'url3', 'url4'],
        expiresAt: new Date(),
      });

      // Act
      const result = await service.generate('user-123', mockDto);

      // Assert
      expect(result.designId).toBe('design-456');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled(); // Pas de décrémentation quota
    });
  });

  // ── findOne ───────────────────────────────────────────────────
  describe('findOne', () => {
    it('devrait retourner un design si l\'utilisateur est propriétaire', async () => {
      mockPrismaService.design.findUnique.mockResolvedValue({
        id: 'design-123',
        userId: 'user-123',
        name: 'Mon design',
      });

      const result = await service.findOne('design-123', 'user-123');

      expect(result.id).toBe('design-123');
    });

    it('devrait lever NotFoundException si le design n\'existe pas', async () => {
      mockPrismaService.design.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistant', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ForbiddenException si l\'utilisateur n\'est pas propriétaire', async () => {
      mockPrismaService.design.findUnique.mockResolvedValue({
        id: 'design-123',
        userId: 'autre-user',
      });

      await expect(service.findOne('design-123', 'user-123')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── remove ────────────────────────────────────────────────────
  describe('remove', () => {
    it('devrait supprimer un design et invalider le cache', async () => {
      mockPrismaService.design.findUnique.mockResolvedValue({
        id: 'design-123',
        userId: 'user-123',
      });
      mockPrismaService.design.delete.mockResolvedValue({});

      await service.remove('design-123', 'user-123');

      expect(mockPrismaService.design.delete).toHaveBeenCalledWith({
        where: { id: 'design-123' },
      });
      expect(mockCacheService.delPattern).toHaveBeenCalledWith('designs:user:user-123:*');
    });
  });
});