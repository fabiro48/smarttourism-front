import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ReviewFormComponent } from './review-form.component';
import { ReviewsService } from '../services/reviews.service';
import { ReviewResponse } from '../models/review.model';

/** Stub de ReviewResponse para respuestas exitosas */
const mockReviewResponse: ReviewResponse = {
  id: 'rev-1',
  touristId: 'tourist-1',
  touristName: 'Juan Pérez',
  touristEmail: 'juan@example.com',
  experienceId: 'exp-1',
  experienceTitle: 'Senderismo',
  rating: 4,
  comment: 'Excelente',
  createdAt: '2024-06-15T10:30:00Z',
};

describe('ReviewFormComponent', () => {
  let component: ReviewFormComponent;
  let fixture: ComponentFixture<ReviewFormComponent>;
  let mockReviewsService: { createReview: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockReviewsService = {
      createReview: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReviewFormComponent],
      providers: [
        { provide: ReviewsService, useValue: mockReviewsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewFormComponent);
    component = fixture.componentInstance;
    component.experienceId = 'exp-1';
    fixture.detectChanges();
  });

  // ─── Formulario oculto con 409 ──────────────────────────────────────────────

  it('el formulario se oculta (isHidden) cuando se recibe un 409', () => {
    mockReviewsService.createReview.mockReturnValue(
      throwError(() => ({ status: 409 }))
    );

    component.rating = 4;
    component.onSubmit();
    fixture.detectChanges();

    expect(component.isHidden).toBe(true);

    const container = fixture.nativeElement.querySelector('.review-form-container');
    expect(container).toBeNull();
  });

  // ─── Botón deshabilitado si rating === 0 ─────────────────────────────────────

  it('el botón de envío está deshabilitado cuando rating === 0', () => {
    component.rating = 0;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  // ─── Envío exitoso ───────────────────────────────────────────────────────────

  it('envío exitoso limpia el formulario y emite reviewCreated', () => {
    mockReviewsService.createReview.mockReturnValue(of(mockReviewResponse));

    let emittedReview: ReviewResponse | undefined;
    component.reviewCreated.subscribe((r: ReviewResponse) => (emittedReview = r));

    component.rating = 4;
    component.comment = 'Excelente';
    component.onSubmit();
    fixture.detectChanges();

    expect(emittedReview).toEqual(mockReviewResponse);
    expect(component.rating).toBe(0);
    expect(component.comment).toBe('');
    expect(component.isSubmitting).toBe(false);
  });

  // ─── Error 403 ──────────────────────────────────────────────────────────────

  it('error 403 muestra mensaje de reserva requerida', () => {
    mockReviewsService.createReview.mockReturnValue(
      throwError(() => ({ status: 403 }))
    );

    component.rating = 3;
    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña'
    );

    const errorEl = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain(
      'Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña'
    );
  });

  // ─── Error 409 ──────────────────────────────────────────────────────────────

  it('error 409 muestra mensaje y oculta el formulario', () => {
    mockReviewsService.createReview.mockReturnValue(
      throwError(() => ({ status: 409 }))
    );

    component.rating = 5;
    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'Ya has dejado una reseña para esta experiencia'
    );
    expect(component.isHidden).toBe(true);

    // El formulario ya no se renderiza
    const container = fixture.nativeElement.querySelector('.review-form-container');
    expect(container).toBeNull();
  });
});
