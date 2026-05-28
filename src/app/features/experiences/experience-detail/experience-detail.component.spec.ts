import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ExperienceDetailComponent } from './experience-detail.component';
import { environment } from '../../../../environments/environment';
import { ExperienceResponse, ScheduleResponse } from '../models/experience.model';
import * as fc from 'fast-check';

/** URL base del servicio */
const BASE_URL = `${environment.apiUrl}/experiences`;

/** Stub mínimo de ExperienceResponse */
function createMockExperience(overrides: Partial<ExperienceResponse> = {}): ExperienceResponse {
  return {
    id: 'exp-1',
    title: 'Senderismo en el Chicamocha',
    description: 'Una experiencia increíble de senderismo por el cañón.',
    category: 'Aventura',
    location: 'Santander',
    duration: 180,
    difficulty: 'MODERATE',
    price: 150000,
    images: ['https://example.com/img1.jpg'],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    averageRating: 4.5,
    reviewCount: 10,
    schedules: [
      { id: 'sch-1', dayOfWeek: 'Lunes', startTime: '08:00', endTime: '12:00', availableSlots: 5 },
      { id: 'sch-2', dayOfWeek: 'Miércoles', startTime: '14:00', endTime: '18:00', availableSlots: 3 },
    ],
    ...overrides,
  };
}

describe('ExperienceDetailComponent', () => {
  let httpTesting: HttpTestingController;
  let fixture: ComponentFixture<ExperienceDetailComponent>;

  function setup(routeId: string | null = 'exp-1') {
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn((key: string) => (key === 'id' ? routeId : null)),
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [ExperienceDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExperienceDetailComponent);
  }

  /**
   * Helper: trigger ngOnInit and flush the HTTP request.
   * With OnPush, flush triggers markForCheck internally, then detectChanges renders.
   */
  function initAndFlush(response: ExperienceResponse = createMockExperience()) {
    fixture.detectChanges(); // triggers ngOnInit → isLoading=true
    httpTesting.expectOne(`${BASE_URL}/exp-1`).flush(response); // subscribe callback → markForCheck
    fixture.detectChanges(); // re-render with loaded data
  }

  afterEach(() => {
    httpTesting.verify();
  });

  // ─── 1. Component creation ────────────────────────────────────────────────────

  it('should create the component', () => {
    // Validates: Requirement 12.1
    setup();
    expect(fixture.componentInstance).toBeTruthy();
    fixture.detectChanges();
    httpTesting.expectOne(`${BASE_URL}/exp-1`).flush(createMockExperience());
  });

  // ─── 2. Loads experience on init ──────────────────────────────────────────────

  it('loads experience on init reading route param id', () => {
    // Validates: Requirement 12.1
    setup('exp-42');
    fixture.detectChanges();

    const req = httpTesting.expectOne(`${BASE_URL}/exp-42`);
    expect(req.request.method).toBe('GET');
    req.flush(createMockExperience({ id: 'exp-42' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.experience?.id).toBe('exp-42');
  });

  // ─── 3. Shows loading state while fetching ────────────────────────────────────

  it('shows loading state while fetching', () => {
    // Validates: Requirement 5.7
    setup();
    fixture.detectChanges(); // triggers ngOnInit, isLoading = true

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.spinner')).not.toBeNull();
    expect(el.textContent).toContain('Cargando');

    // Flush to avoid afterEach verify error
    httpTesting.expectOne(`${BASE_URL}/exp-1`).flush(createMockExperience());
  });

  // ─── 4. Shows experience details after successful load ────────────────────────

  it('shows experience details after successful load', () => {
    // Validates: Requirement 12.2
    setup();
    const exp = createMockExperience();
    initAndFlush(exp);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain(exp.title);
    expect(el.textContent).toContain(exp.description);
    expect(el.textContent).toContain(exp.category);
    expect(el.textContent).toContain(exp.location);
    expect(el.textContent).toContain(String(exp.duration));
    expect(el.textContent).toContain(exp.difficulty);
  });

  // ─── 5. Shows "Experiencia no encontrada" when 404 error ─────────────────────

  it('shows "Experiencia no encontrada" when 404 error', () => {
    // Validates: Requirement 12.3
    setup();
    fixture.detectChanges();

    httpTesting
      .expectOne(`${BASE_URL}/exp-1`)
      .flush('Not Found', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Experiencia no encontrada');
    expect(fixture.componentInstance.notFound).toBe(true);
  });

  // ─── 6. Shows generic error message for non-404 errors ────────────────────────

  it('shows generic error message for non-404 errors', () => {
    // Validates: Requirement 12.4
    setup();
    fixture.detectChanges();

    httpTesting
      .expectOne(`${BASE_URL}/exp-1`)
      .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'Error al cargar la experiencia'
    );
    expect(fixture.componentInstance.errorMessage).toBe(
      'Error al cargar la experiencia. Intenta de nuevo más tarde'
    );
  });

  // ─── 7. Shows "Volver al listado" link ────────────────────────────────────────

  it('shows "Volver al listado" link after successful load', () => {
    // Validates: Requirement 5.10
    setup();
    initAndFlush();

    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('a[href="/experiences"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.textContent).toContain('Volver al listado');
  });

  // ─── 8. Shows schedules when available ────────────────────────────────────────

  it('shows schedules when available', () => {
    // Validates: Requirement 5.4
    setup();
    const schedules: ScheduleResponse[] = [
      { id: 'sch-1', dayOfWeek: 'Lunes', startTime: '08:00', endTime: '12:00', availableSlots: 5 },
      { id: 'sch-2', dayOfWeek: 'Viernes', startTime: '09:00', endTime: '13:00', availableSlots: 2 },
    ];
    initAndFlush(createMockExperience({ schedules }));

    const el: HTMLElement = fixture.nativeElement;
    const listItems = el.querySelectorAll('.schedules ul li');
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toContain('Lunes');
    expect(listItems[0].textContent).toContain('08:00');
    expect(listItems[0].textContent).toContain('12:00');
    expect(listItems[1].textContent).toContain('Viernes');
    expect(listItems[1].textContent).toContain('09:00');
    expect(listItems[1].textContent).toContain('13:00');
  });

  // ─── 9. Shows "No hay horarios disponibles" when schedules is empty ───────────

  it('shows "No hay horarios disponibles" when schedules is empty', () => {
    // Validates: Requirement 12.5
    setup();
    initAndFlush(createMockExperience({ schedules: [] }));

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No hay horarios disponibles actualmente');
  });

  // ─── 10. Shows "Sin reseñas" when averageRating is null ───────────────────────

  it('shows "Sin reseñas" when averageRating is null', () => {
    // Validates: Requirement 5.6
    setup();
    initAndFlush(createMockExperience({ averageRating: null, reviewCount: 0 }));

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Sin reseñas');
  });
});

// ─── P4 — Completitud de renderizado de horarios (PBT) ──────────────────────
/**
 * P4 — Completitud de renderizado de horarios (ExperienceDetailComponent):
 * For any array of ScheduleResponse objects (1 to 10 items), the rendered DOM
 * must contain exactly as many `<li>` elements in the schedules section as there
 * are schedules in the input array. Each `<li>` must contain the dayOfWeek,
 * startTime, and endTime of the corresponding schedule.
 *
 * **Validates: Requirements 12.6**
 */
describe('P4 — Completitud de renderizado de horarios (ExperienceDetailComponent)', () => {
  let httpTesting: HttpTestingController;
  let fixture: ComponentFixture<ExperienceDetailComponent>;

  beforeEach(() => {
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn((key: string) => (key === 'id' ? 'exp-pbt' : null)),
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [ExperienceDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExperienceDetailComponent);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  /** Arbitrary for ScheduleResponse */
  const scheduleArb = fc.record({
    id: fc.uuid(),
    dayOfWeek: fc.constantFrom('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
    startTime: fc.tuple(
      fc.integer({ min: 0, max: 23 }),
      fc.integer({ min: 0, max: 59 })
    ).map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
    endTime: fc.tuple(
      fc.integer({ min: 0, max: 23 }),
      fc.integer({ min: 0, max: 59 })
    ).map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
    availableSlots: fc.integer({ min: 0, max: 50 }),
  });

  it('renders exactly N <li> elements for N schedules, each containing dayOfWeek, startTime, and endTime', () => {
    fc.assert(
      fc.property(
        fc.array(scheduleArb, { minLength: 1, maxLength: 10 }),
        (schedules) => {
          // Reset component state for each property run
          TestBed.resetTestingModule();

          const activatedRouteMock = {
            snapshot: {
              paramMap: {
                get: vi.fn((key: string) => (key === 'id' ? 'exp-pbt' : null)),
              },
            },
          };

          TestBed.configureTestingModule({
            imports: [ExperienceDetailComponent],
            providers: [
              provideHttpClient(),
              provideHttpClientTesting(),
              provideRouter([]),
              { provide: ActivatedRoute, useValue: activatedRouteMock },
            ],
          });

          const localHttpTesting = TestBed.inject(HttpTestingController);
          const localFixture = TestBed.createComponent(ExperienceDetailComponent);

          const experience: ExperienceResponse = {
            id: 'exp-pbt',
            title: 'Test Experience',
            description: 'Description',
            category: 'Test',
            location: 'Test Location',
            duration: 60,
            difficulty: 'EASY',
            price: 50000,
            images: [],
            active: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            averageRating: 4.0,
            reviewCount: 5,
            schedules,
          };

          // Trigger ngOnInit
          localFixture.detectChanges();
          // Flush HTTP request
          localHttpTesting.expectOne(`${environment.apiUrl}/experiences/exp-pbt`).flush(experience);
          // Re-render
          localFixture.detectChanges();

          const el: HTMLElement = localFixture.nativeElement;
          const listItems = el.querySelectorAll('.schedules ul li');

          // Property: number of <li> equals number of schedules
          expect(listItems.length).toBe(schedules.length);

          // Property: each <li> contains the corresponding schedule data
          schedules.forEach((schedule, index) => {
            const liText = listItems[index].textContent || '';
            expect(liText).toContain(schedule.dayOfWeek);
            expect(liText).toContain(schedule.startTime);
            expect(liText).toContain(schedule.endTime);
          });

          localHttpTesting.verify();
          localFixture.destroy();
        }
      ),
      { numRuns: 50 }
    );
  });
});
