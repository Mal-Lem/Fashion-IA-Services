import { Test, TestingModule } from '@nestjs/testing';
import { CouturieresService } from './couturieres.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CacheService } from '../cache/cache.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  couturiereProfile: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  review: { findMany: jest.fn() },
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

describe('CouturieresService', () => {
  let service: CouturieresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouturieresService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventsService, useValue: mockEventsService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<CouturieresService>(CouturieresService);
    jest.clearAllMocks();
  });

  // ── createProfile ─────────────────────────────────────────────
  describe('createProfile', () => {
    const mockDto = {
      atelierName: 'Atelier Marie',
      specialties: ['robes', 'mariage'],
      locationCity: 'Paris',
      locationRegion: 'Ile-de-France',
      locationZip: '75011',
    };

    it('devrait créer un profil avec succès', async () => {
      mockPrismaService.couturiereProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.couturiereProfile.create.mockResolvedValue({
        id: 'profile-123',
        userId: 'user-123',
        atelierName: mockDto.atelierName,
        specialties: mockDto.specialties,
        locationCity: mockDto.locationCity,
        locationRegion: mockDto.locationRegion,
        portfolioPhotos: [],
        profileCompletionPct: 0,
      });
      mockPrismaService.couturiereProfile.update.mockResolvedValue({
        id: 'profile-123',
        profileCompletionPct: 57,
        isVisible: false,
      });

      const result = await service.createProfile('user-123', mockDto);

      expect(mockPrismaService.couturiereProfile.create).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('devrait rejeter si un profil existe déjà', async () => {
      mockPrismaService.couturiereProfile.findUnique.mockResolvedValue({
        id: 'existing-profile',
      });

      await expect(service.createProfile('user-123', mockDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ── search ────────────────────────────────────────────────────
  describe('search', () => {
    it('devrait retourner les couturières avec un score ML', async () => {
      const mockCouturieres = [
        {
          id: 'c1',
          atelierName: 'Atelier A',
          avgRating: 4.8,
          reviewCount: 20,
          availabilityStatus: 'available',
          profileCompletionPct: 90,
          isCertified: true,
          specialties: ['robes'],
          user: { firstName: 'Marie', lastName: 'D', avatarUrl: null },
        },
        {
          id: 'c2',
          atelierName: 'Atelier B',
          avgRating: 3.5,
          reviewCount: 5,
          availabilityStatus: 'busy',
          profileCompletionPct: 60,
          isCertified: false,
          specialties: ['retouches'],
          user: { firstName: 'Sophie', lastName: 'M', avatarUrl: null },
        },
      ];

      mockPrismaService.couturiereProfile.findMany.mockResolvedValue(mockCouturieres);
      mockPrismaService.couturiereProfile.count.mockResolvedValue(2);

      const result = await service.search({});

      expect(result.data).toHaveLength(2);
      expect(result.data[0].matchScore).toBeGreaterThan(result.data[1].matchScore);
      // La couturière certifiée et disponible doit avoir un meilleur score
      expect(result.data[0].id).toBe('c1');
    });

    it('devrait retourner une liste vide si aucune couturière visible', async () => {
      mockPrismaService.couturiereProfile.findMany.mockResolvedValue([]);
      mockPrismaService.couturiereProfile.count.mockResolvedValue(0);

      const result = await service.search({});

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ── findOne ───────────────────────────────────────────────────
  describe('findOne', () => {
    it('devrait retourner un profil avec ses avis', async () => {
      mockPrismaService.couturiereProfile.findUnique.mockResolvedValue({
        id: 'profile-123',
        userId: 'user-123',
        atelierName: 'Atelier Marie',
        user: { firstName: 'Marie', lastName: 'D', avatarUrl: null, createdAt: new Date() },
      });
      mockPrismaService.review.findMany.mockResolvedValue([
        { id: 'review-1', rating: 5, comment: 'Excellent !', reviewer: { firstName: 'Sophie' } },
      ]);

      const result = await service.findOne('profile-123');

      expect(result.id).toBe('profile-123');
      expect(result.reviews).toHaveLength(1);
    });

    it('devrait lever NotFoundException si le profil n\'existe pas', async () => {
      mockPrismaService.couturiereProfile.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistant')).rejects.toThrow(NotFoundException);
    });
  });
});