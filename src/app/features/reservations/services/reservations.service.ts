import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminReservationFilters,
  Page,
  ReservationRequest,
  ReservationResponse,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reservations`;
  private adminUrl = `${environment.apiUrl}/admin/reservations`;

  /**
   * Crea una nueva reserva.
   */
  createReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.baseUrl, request);
  }

  /**
   * Obtiene las reservas del turista autenticado.
   */
  getMyReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.baseUrl}/me`);
  }

  /**
   * Cancela una reserva por su ID.
   */
  cancelReservation(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, null);
  }

  /**
   * Obtiene el listado paginado de reservas para administración,
   * aplicando solo los filtros cuyo valor no sea null ni undefined.
   */
  getAdminReservations(
    filters: AdminReservationFilters = {},
    page = 0,
    size = 20
  ): Observable<Page<ReservationResponse>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    for (const key of Object.keys(filters) as (keyof AdminReservationFilters)[]) {
      const value = filters[key];
      if (value !== null && value !== undefined) {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<Page<ReservationResponse>>(this.adminUrl, { params });
  }
}
