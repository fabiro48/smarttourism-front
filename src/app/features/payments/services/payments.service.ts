import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentResponse } from '../../reservations/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/payments`;

  /**
   * Obtiene el historial de pagos del turista autenticado.
   * Realiza GET a /api/v1/payments/me.
   * Los errores HTTP se propagan sin transformar (authInterceptor maneja 401 globalmente).
   */
  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.baseUrl}/me`);
  }

  /**
   * Simula un pago para una reserva dada.
   * Realiza POST a /api/v1/payments/simulate con el reservationId en el body.
   * Los errores HTTP se propagan sin transformar.
   */
  simulatePayment(reservationId: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/simulate`, { reservationId });
  }
}
