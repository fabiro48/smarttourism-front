import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ExperienceFilters,
  ExperienceRequest,
  ExperienceResponse,
  Page,
} from '../models/experience.model';

@Injectable({ providedIn: 'root' })
export class ExperiencesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/experiences`;

  /**
   * Obtiene el listado paginado de experiencias, aplicando solo los filtros
   * cuyo valor no sea null ni undefined.
   */
  getExperiences(
    filters: ExperienceFilters = {},
    page = 0,
    size = 20
  ): Observable<Page<ExperienceResponse>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    for (const key of Object.keys(filters) as (keyof ExperienceFilters)[]) {
      const value = filters[key];
      if (value !== null && value !== undefined) {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<Page<ExperienceResponse>>(this.baseUrl, { params });
  }

  /**
   * Obtiene el detalle de una experiencia por su ID.
   */
  getExperienceById(id: string): Observable<ExperienceResponse> {
    return this.http.get<ExperienceResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva experiencia (solo ADMIN).
   */
  createExperience(request: ExperienceRequest): Observable<ExperienceResponse> {
    return this.http.post<ExperienceResponse>(this.baseUrl, request);
  }

  /**
   * Actualiza una experiencia existente (solo ADMIN).
   */
  updateExperience(
    id: string,
    request: ExperienceRequest
  ): Observable<ExperienceResponse> {
    return this.http.put<ExperienceResponse>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Desactiva (borrado lógico) una experiencia (solo ADMIN).
   */
  deleteExperience(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
