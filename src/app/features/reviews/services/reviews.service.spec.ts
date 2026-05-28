import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReviewsService } from './reviews.service';
import { environment } from '../../../../environments/environment';
import { ReviewRequest, ReviewResponse } from '../models/review.model';

/** URL base del servicio */
const BASE_URL = `${environment.apiUrl}/reviews`;

/** Stub mínimo de ReviewResponse */
const mockReview: ReviewResponse = {
  id: 'rev-1',
  touristId: 'tourist-1',
  touristName: 'Juan Pérez',
  touristEmail: 'juan@example.com',
  experienceId: 'exp-1',
  experienceTitle: 'Senderismo en el Chicamocha',
  rating: 4,
  comment: 'Excelente experiencia',
  createdAt: '2024-06-15T10:30:00Z',
};

/** Stub de ReviewRequest */
const mockRequest: ReviewRequest = {
  experienceId: 'exp-1',
  rating: 5,
  comment: 'Increíble',
};

describe('ReviewsService', () => {
  let service: ReviewsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ReviewsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // ─── getReviewsByExperience() ────────────────────────────────────────────────

  describe('getReviewsByExperience()', () => {
    it('realiza GET a /reviews/experiences/{id}/reviews', () => {
      const experienceId = 'exp-42';

      service.getReviewsByExperience(experienceId).subscribe(res => {
        expect(res).toEqual([mockReview]);
      });

      const req = httpTesting.expectOne(
        `${BASE_URL}/experiences/${experienceId}/reviews`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockReview]);
    });
  });

  // ─── createReview() ──────────────────────────────────────────────────────────

  describe('createReview()', () => {
    it('realiza POST a /reviews con el cuerpo correcto', () => {
      service.createReview(mockRequest).subscribe(res => {
        expect(res).toEqual(mockReview);
      });

      const req = httpTesting.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockReview);
    });
  });

  // ─── Error propagation ───────────────────────────────────────────────────────

  describe('Error propagation', () => {
    it('errores HTTP se propagan al suscriptor', () => {
      let errorResponse: any;
      let nextCalled = false;

      service.getReviewsByExperience('exp-1').subscribe({
        next: () => { nextCalled = true; },
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpTesting.expectOne(
        `${BASE_URL}/experiences/exp-1/reviews`
      );
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(nextCalled).toBe(false);
      expect(errorResponse).toBeTruthy();
      expect(errorResponse.status).toBe(500);
    });
  });
});
