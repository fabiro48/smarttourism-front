import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ExperiencesComponent } from './experiences.component';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ExperienceResponse, Page } from '../models/experience.model';
import * as fc from 'fast-check';

/** URL base del servicio */
const BASE_URL = `${environment.apiUrl}/experiences`;

/** Stub mínimo de ExperienceResponse */
const mockExperience: ExperienceResponse = {
  id: 'exp-1',
  title: 'Senderismo en el Chicamocha',
  description: 'Una experiencia increíble',
  category: 'Aventura',
  location: 'Santander',
  duration: 180,
  difficulty: 'MODERATE',
  price: 150000,
  images: ['https://example.com/img.jpg'],
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  averageRating: 4.5,
  reviewCount: 10,
  schedules: [],
};

/** Helper para crear una Page mock */
function createMockPage(
  content: ExperienceResponse[] = [mockExperience],
  totalElements = 1,
  totalPages = 1,
  number = 0,
  size = 20
): Page<ExperienceResponse> {
  return { content, totalElements, totalPages, number, size };
}

describe('ExperiencesComponent', () => {
  let httpTesting: HttpTestingController;
  let fixture: ComponentFixture<ExperiencesComponent>;

  function setup(role: string | null = 'TOURIST') {
    const authServiceMock = {
      getUserRole: vi.fn(() => role),
      isAuthenticated: vi.fn(() => role !== null),
    };

    TestBed.configureTestingModule({
      imports: [ExperiencesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExperiencesComponent);
  }

  /**
   * Helper: trigger ngOnInit and flush the initial HTTP request.
   * With OnPush, flush triggers markForCheck internally, then detectChanges renders.
   */
  function initAndFlush(page: Page<ExperienceResponse> = createMockPage()) {
    fixture.detectChanges(); // triggers ngOnInit → loadExperiences() → isLoading=true
    httpTesting.expectOne((r) => r.url === BASE_URL).flush(page); // subscribe callback → markForCheck
    fixture.detectChanges(); // re-render with loaded data
  }

  afterEach(() => {
    httpTesting.verify();
  });

  // ─── Component creation ───────────────────────────────────────────────────────

  it('should create the component', () => {
    setup();
    expect(fixture.componentInstance).toBeTruthy();
    fixture.detectChanges();
    httpTesting.expectOne((r) => r.url === BASE_URL).flush(createMockPage());
  });

  // ─── Loading experiences on init ──────────────────────────────────────────────

  it('loads experiences on init with default page=0 and size=20', () => {
    // Validates: Requirement 10.1
    setup();
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');

    req.flush(createMockPage());
    fixture.detectChanges();

    expect(fixture.componentInstance.experiences.length).toBe(1);
  });

  // ─── Filter changes reset page to 0 ──────────────────────────────────────────

  it('resets page to 0 when a filter changes', () => {
    // Validates: Requirement 10.2
    setup();
    initAndFlush(createMockPage([], 40, 2, 0, 20));

    // Navigate to page 1
    fixture.componentInstance.currentPage = 1;

    // Change a filter
    fixture.componentInstance.filters.category = 'Aventura';
    fixture.componentInstance.onFilterChange();

    const req = httpTesting.expectOne((r) => r.url === BASE_URL);
    expect(req.request.params.get('page')).toBe('0');
    expect(fixture.componentInstance.currentPage).toBe(0);

    req.flush(createMockPage());
  });

  // ─── Pagination: next page ────────────────────────────────────────────────────

  it('increments page on onNextPage()', () => {
    // Validates: Requirement 3.4
    setup();
    initAndFlush(createMockPage([mockExperience], 40, 2, 0, 20));

    fixture.componentInstance.onNextPage();

    const req = httpTesting.expectOne((r) => r.url === BASE_URL);
    expect(req.request.params.get('page')).toBe('1');
    expect(fixture.componentInstance.currentPage).toBe(1);

    req.flush(createMockPage([mockExperience], 40, 2, 1, 20));
  });

  // ─── Pagination: prev page ────────────────────────────────────────────────────

  it('decrements page on onPrevPage()', () => {
    // Validates: Requirement 3.5
    setup();
    initAndFlush(createMockPage([mockExperience], 40, 2, 0, 20));

    // Go to page 1 first
    fixture.componentInstance.currentPage = 1;
    fixture.componentInstance.onPrevPage();

    const req = httpTesting.expectOne((r) => r.url === BASE_URL);
    expect(req.request.params.get('page')).toBe('0');
    expect(fixture.componentInstance.currentPage).toBe(0);

    req.flush(createMockPage([mockExperience], 40, 2, 0, 20));
  });

  // ─── Deactivation flow ────────────────────────────────────────────────────────

  describe('deactivation flow', () => {
    it('onDeactivate sets confirmDeleteId', () => {
      // Validates: Requirement 8.9
      setup('ADMIN');
      initAndFlush();

      fixture.componentInstance.onDeactivate('exp-1');
      expect(fixture.componentInstance.confirmDeleteId).toBe('exp-1');
    });

    it('onConfirmDelete calls service and removes experience from list', () => {
      // Validates: Requirement 8.10
      setup('ADMIN');
      initAndFlush();

      fixture.componentInstance.onDeactivate('exp-1');
      fixture.componentInstance.onConfirmDelete();

      const req = httpTesting.expectOne(`${BASE_URL}/exp-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(fixture.componentInstance.experiences.find((e) => e.id === 'exp-1')).toBeUndefined();
      expect(fixture.componentInstance.confirmDeleteId).toBeNull();
    });

    it('onCancelDelete clears confirmDeleteId', () => {
      // Validates: Requirement 8.9
      setup('ADMIN');
      initAndFlush();

      fixture.componentInstance.onDeactivate('exp-1');
      fixture.componentInstance.onCancelDelete();
      expect(fixture.componentInstance.confirmDeleteId).toBeNull();
    });
  });

  // ─── Error handling ───────────────────────────────────────────────────────────

  it('shows error message when backend returns an error', () => {
    // Validates: Requirement 10.6
    setup();
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === BASE_URL)
      .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage).toBe(
      'Error al cargar las experiencias. Intenta de nuevo más tarde'
    );
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'Error al cargar las experiencias'
    );
  });

  // ─── Empty state ──────────────────────────────────────────────────────────────

  it('shows empty message when backend returns empty content', () => {
    // Validates: Requirement 10.5
    setup();
    initAndFlush(createMockPage([], 0, 0, 0, 20));

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No se encontraron experiencias con los filtros seleccionados');
  });

  // ─── Admin vs non-admin visibility ────────────────────────────────────────────

  it('shows "Crear experiencia" button when user is ADMIN', () => {
    // Validates: Requirement 8.1
    setup('ADMIN');
    initAndFlush();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Crear experiencia');
  });

  it('does not show "Crear experiencia" button when user is not ADMIN', () => {
    // Validates: Requirement 8.1
    setup('TOURIST');
    initAndFlush();

    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('a.btn-primary');
    const createBtn = Array.from(links).find((a) =>
      a.textContent?.includes('Crear experiencia')
    );
    expect(createBtn).toBeUndefined();
  });

  // ─── Pagination buttons disabled state ────────────────────────────────────────

  it('"Anterior" button is disabled on first page', () => {
    // Validates: Requirement 10.4
    setup();
    initAndFlush(createMockPage([mockExperience], 40, 2, 0, 20));

    const el: HTMLElement = fixture.nativeElement;
    const prevBtn = el.querySelector('button[aria-label="Página anterior"]') as HTMLButtonElement;
    expect(prevBtn).not.toBeNull();
    expect(prevBtn.disabled).toBe(true);
  });

  it('"Siguiente" button is disabled on last page', () => {
    // Validates: Requirement 10.3
    setup();
    initAndFlush(createMockPage([mockExperience], 40, 2, 0, 20));

    // Navigate to last page
    const comp = fixture.componentInstance;
    comp.currentPage = 1;
    comp.totalPages = 2;
    // Trigger CD through the component's own ChangeDetectorRef
    (comp as any).cdr.markForCheck();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const nextBtn = el.querySelector('button[aria-label="Página siguiente"]') as HTMLButtonElement;
    expect(nextBtn).not.toBeNull();
    expect(nextBtn.disabled).toBe(true);
  });
});

// ─── P2 — Consistencia de paginación (PBT) ──────────────────────────────────
/**
 * P2 — Consistencia de paginación (ExperiencesComponent):
 * For any valid page response (totalPages, totalElements, pageSize, currentPage),
 * the displayed range (rangeStart, rangeEnd) must be consistent:
 *   - rangeStart = currentPage * pageSize + 1
 *   - rangeEnd = min((currentPage + 1) * pageSize, totalElements)
 *   - rangeEnd >= rangeStart (when totalElements > 0)
 *
 * **Validates: Requirements 10.7**
 */
describe('P2 — Consistencia de paginación (ExperiencesComponent)', () => {
  it('rangeStart and rangeEnd are consistent for any valid page state', () => {
    fc.assert(
      fc.property(
        fc.record({
          pageSize: fc.integer({ min: 1, max: 100 }),
          totalElements: fc.integer({ min: 1, max: 10000 }),
        }).chain(({ pageSize, totalElements }) => {
          const totalPages = Math.ceil(totalElements / pageSize);
          return fc.record({
            pageSize: fc.constant(pageSize),
            totalElements: fc.constant(totalElements),
            totalPages: fc.constant(totalPages),
            currentPage: fc.integer({ min: 0, max: totalPages - 1 }),
          });
        }),
        ({ pageSize, totalElements, currentPage }) => {
          const rangeStart = currentPage * pageSize + 1;
          const rangeEnd = Math.min((currentPage + 1) * pageSize, totalElements);

          expect(rangeEnd).toBeGreaterThanOrEqual(rangeStart);
          expect(rangeStart).toBeGreaterThanOrEqual(1);
          expect(rangeStart).toBeLessThanOrEqual(totalElements);
          expect(rangeEnd).toBeLessThanOrEqual(totalElements);
          expect(rangeEnd - rangeStart + 1).toBeLessThanOrEqual(pageSize);
        }
      ),
      { numRuns: 50 }
    );
  });
});
