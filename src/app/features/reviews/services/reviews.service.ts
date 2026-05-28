import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReviewRequest, ReviewResponse } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reviews`;

  /**
   * Obtiene todas las reseñas de una experiencia.
   * Endpoint: GET /api/v1/reviews/experiences/{experienceId}/reviews
   */
  getReviewsByExperience(experienceId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(
      `${this.baseUrl}/experiences/${experienceId}/reviews`
    );
  }

  /**
   * Crea una nueva reseña.
   * Endpoint: POST /api/v1/reviews
   * Requiere autenticación con rol TOURIST.
   */
  createReview(request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.baseUrl, request);
  }
}
