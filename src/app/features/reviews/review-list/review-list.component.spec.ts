import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ReviewListComponent } from './review-list.component';
import { ReviewsService } from '../services/reviews.service';
import { ReviewResponse } from '../models/review.model';

/** Helper para crear stubs de ReviewResponse */
function createMockReview(overrides: Partial<ReviewResponse> = {}): ReviewResponse {
  return {
    id: 'rev-1',
    touristId: 'tourist-1',
    touristName: 'Juan Pérez',
    touristEmail: 'juan@example.com',
    experienceId: 'exp-1',
    experienceTitle: 'Senderismo',
    rating: 4,
    comment: 'Muy buena experiencia',
    createdAt: '2024-06-15T10:30:00Z',
    ...overrides,
  };
}

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;
  let mockReviewsService: { getReviewsByExperience: ReturnType<typeof vi.fn> };

  function setupComponent(serviceReturn: Observable<ReviewResponse[]>) {
    mockReviewsService = {
      getReviewsByExperience: vi.fn().mockReturnValue(serviceReturn),
    };

    TestBed.configureTestingModule({
      imports: [ReviewListComponent],
      providers: [
        { provide: ReviewsService, useValue: mockReviewsService },
      ],
    });

    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    component.experienceId = 'exp-1';
    fixture.detectChanges();
  }

  // ─── Lista vacía ─────────────────────────────────────────────────────────────

  it('muestra mensaje vacío cuando la lista de reseñas está vacía', () => {
    setupComponent(of([]));

    const emptyMsg = fixture.nativeElement.querySelector('.empty-message');
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.textContent).toContain('Aún no hay reseñas para esta experiencia');
  });

  // ─── Error del backend ───────────────────────────────────────────────────────

  it('muestra mensaje de error cuando el backend retorna error', () => {
    setupComponent(throwError(() => new Error('Server error')) as unknown as Observable<ReviewResponse[]>);

    const errorMsg = fixture.nativeElement.querySelector('.error-message');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain('Error al cargar las reseñas');
  });

  // ─── P2 — Completitud de renderizado (PBT) ──────────────────────────────────

  describe('P2 — Completitud de renderizado: todas las reseñas se muestran', () => {
    const testCases = [
      [createMockReview({ id: 'r1', touristName: 'Ana García' })],
      [
        createMockReview({ id: 'r1', touristName: 'Ana García' }),
        createMockReview({ id: 'r2', touristName: 'Carlos López' }),
      ],
      [
        createMockReview({ id: 'r1', touristName: 'Ana García' }),
        createMockReview({ id: 'r2', touristName: 'Carlos López' }),
        createMockReview({ id: 'r3', touristName: 'María Rodríguez' }),
        createMockReview({ id: 'r4', touristName: 'Pedro Sánchez' }),
        createMockReview({ id: 'r5', touristName: 'Laura Martínez' }),
      ],
    ];

    for (const reviews of testCases) {
      it(`para ${reviews.length} reseña(s), todas se renderizan con touristName visible`, () => {
        setupComponent(of(reviews));

        const articles = fixture.nativeElement.querySelectorAll('article.review-card');
        expect(articles.length).toBe(reviews.length);

        const renderedNames = Array.from(
          fixture.nativeElement.querySelectorAll('.tourist-name')
        ).map((el: any) => el.textContent.trim());

        for (const review of reviews) {
          expect(renderedNames).toContain(review.touristName);
        }
      });
    }
  });

  // ─── Orden por fecha descendente ─────────────────────────────────────────────

  it('las reseñas se muestran ordenadas por fecha descendente (más reciente primero)', () => {
    const reviews: ReviewResponse[] = [
      createMockReview({ id: 'r1', touristName: 'Antiguo', createdAt: '2024-01-01T00:00:00Z' }),
      createMockReview({ id: 'r2', touristName: 'Reciente', createdAt: '2024-06-15T00:00:00Z' }),
      createMockReview({ id: 'r3', touristName: 'Medio', createdAt: '2024-03-10T00:00:00Z' }),
    ];

    setupComponent(of(reviews));

    const names = Array.from(
      fixture.nativeElement.querySelectorAll('.tourist-name')
    ).map((el: any) => el.textContent.trim());

    // Orden esperado: Reciente, Medio, Antiguo
    expect(names[0]).toBe('Reciente');
    expect(names[1]).toBe('Medio');
    expect(names[2]).toBe('Antiguo');
  });
});
