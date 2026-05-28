import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ExperiencesService } from './experiences.service';
import { environment } from '../../../../environments/environment';
import {
  ExperienceFilters,
  ExperienceRequest,
  ExperienceResponse,
  Page,
} from '../models/experience.model';

/** URL base del servicio */
const BASE_URL = `${environment.apiUrl}/experiences`;

/** Stub mínimo de ExperienceResponse para usar en tests */
const mockExperience: ExperienceResponse = {
  id: 'exp-1',
  title: 'Senderismo en el Chicamocha',
  description: 'Una experiencia increíble',
  category: 'Aventura',
  location: 'Santander',
  duration: 180,
  difficulty: 'MODERATE',
  price: 150000,
  images: [],
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  averageRating: 4.5,
  reviewCount: 10,
  schedules: [],
};

/** Stub mínimo de ExperienceRequest */
const mockRequest: ExperienceRequest = {
  title: 'Senderismo en el Chicamocha',
  description: 'Una experiencia increíble',
  category: 'Aventura',
  location: 'Santander',
  duration: 180,
  difficulty: 'MODERATE',
  price: 150000,
};

/** Stub de Page<ExperienceResponse> */
const mockPage: Page<ExperienceResponse> = {
  content: [mockExperience],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
};

describe('ExperiencesService', () => {
  let service: ExperiencesService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExperiencesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ExperiencesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // ─── getExperiences() ────────────────────────────────────────────────────────

  describe('getExperiences()', () => {
    it('sin filtros → GET con page=0 y size=20 como únicos query params', () => {
      // Validates: Requirement 9.1
      service.getExperiences().subscribe();

      const req = httpTesting.expectOne(r => r.url === BASE_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('20');
      // No debe haber parámetros de filtro
      expect(req.request.params.keys().length).toBe(2);
      req.flush(mockPage);
    });

    it('con filtros activos → solo los parámetros no nulos aparecen en la URL', () => {
      // Validates: Requirement 9.2
      const filters: ExperienceFilters = {
        category: 'Aventura',
        location: null,       // debe omitirse
        difficulty: 'EASY',
        minPrice: undefined,  // debe omitirse
        maxPrice: 200000,
        available: null,      // debe omitirse
      };

      service.getExperiences(filters, 1, 10).subscribe();

      const req = httpTesting.expectOne(r => r.url === BASE_URL);
      expect(req.request.method).toBe('GET');

      const params = req.request.params;
      expect(params.get('category')).toBe('Aventura');
      expect(params.get('difficulty')).toBe('EASY');
      expect(params.get('maxPrice')).toBe('200000');
      expect(params.get('page')).toBe('1');
      expect(params.get('size')).toBe('10');

      // Los filtros nulos/undefined NO deben estar presentes
      expect(params.has('location')).toBe(false);
      expect(params.has('minPrice')).toBe(false);
      expect(params.has('available')).toBe(false);

      req.flush(mockPage);
    });
  });

  // ─── getExperienceById() ─────────────────────────────────────────────────────

  describe('getExperienceById()', () => {
    it('realiza GET a /experiences/{id}', () => {
      // Validates: Requirement 9.3
      const id = 'exp-42';

      service.getExperienceById(id).subscribe(res => {
        expect(res).toEqual(mockExperience);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockExperience);
    });
  });

  // ─── createExperience() ──────────────────────────────────────────────────────

  describe('createExperience()', () => {
    it('realiza POST a /experiences con el cuerpo correcto', () => {
      // Validates: Requirement 9.4
      service.createExperience(mockRequest).subscribe(res => {
        expect(res).toEqual(mockExperience);
      });

      const req = httpTesting.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockExperience);
    });
  });

  // ─── updateExperience() ──────────────────────────────────────────────────────

  describe('updateExperience()', () => {
    it('realiza PUT a /experiences/{id} con el cuerpo correcto', () => {
      // Validates: Requirement 9.5
      const id = 'exp-7';

      service.updateExperience(id, mockRequest).subscribe(res => {
        expect(res).toEqual(mockExperience);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockExperience);
    });
  });

  // ─── deleteExperience() ──────────────────────────────────────────────────────

  describe('deleteExperience()', () => {
    it('realiza DELETE a /experiences/{id}', () => {
      // Validates: Requirement 9.6
      const id = 'exp-99';

      service.deleteExperience(id).subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});

// ─── P1 — Completitud de filtros ─────────────────────────────────────────────
// Validates: Requirement 9.7

/**
 * P1 — Completitud de filtros:
 * Para cualquier ExperienceFilters con valores no nulos, todos esos filtros
 * aparecen como query params en la URL de la petición GET.
 *
 * Se implementa con un array de casos representativos que cubren el espacio
 * de combinaciones relevantes (sin librería externa de PBT).
 *
 * **Validates: Requirements 9.7**
 */
describe('P1 — Completitud de filtros (ExperiencesService)', () => {
  let service: ExperiencesService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExperiencesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ExperiencesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  /** Casos representativos: cada entrada es un objeto ExperienceFilters con valores no nulos */
  const filterCases: ExperienceFilters[] = [
    // Un solo filtro de texto
    { category: 'Aventura' },
    // Combinación de dos filtros
    { difficulty: 'HARD', minPrice: 50000 },
    // Todos los filtros a la vez
    {
      category: 'Gastronomía',
      location: 'Girón',
      difficulty: 'MODERATE',
      minPrice: 20000,
      maxPrice: 150000,
      available: true,
    },
  ];

  for (const filters of filterCases) {
    const description = JSON.stringify(filters);

    it(`todos los filtros no nulos aparecen como query params: ${description}`, () => {
      service.getExperiences(filters).subscribe();

      const req = httpTesting.expectOne(r => r.url === BASE_URL);
      const params = req.request.params;

      // Verificar que cada clave con valor no nulo/undefined está en los params
      for (const key of Object.keys(filters) as (keyof ExperienceFilters)[]) {
        const value = filters[key];
        if (value !== null && value !== undefined) {
          expect(params.has(key)).toBe(true);
          expect(params.get(key)).toBe(String(value));
        }
      }

      // Verificar que page y size siempre están presentes
      expect(params.has('page')).toBe(true);
      expect(params.has('size')).toBe(true);

      req.flush({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
      });
    });
  }
});
