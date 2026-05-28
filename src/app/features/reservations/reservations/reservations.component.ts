import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationsService } from '../services/reservations.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { ReservationResponse } from '../models/reservation.model';
import { ReservationCardComponent } from '../reservation-card/reservation-card.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, ReservationCardComponent],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsComponent implements OnInit {
  private reservationsService = inject(ReservationsService);
  private paymentsService = inject(PaymentsService);
  private cdr = inject(ChangeDetectorRef);

  reservations: ReservationResponse[] = [];
  isLoading = false;
  errorMessage = '';
  paymentLoading: string | null = null;
  cancelLoading: string | null = null;
  confirmPayId: string | null = null;
  confirmCancelId: string | null = null;
  paymentMessage: string | null = null;
  paymentMessageType: 'success' | 'warning' | 'error' | null = null;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reservationsService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Error al cargar tus reservas. Intenta de nuevo más tarde';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onPay(reservationId: string): void {
    this.confirmPayId = reservationId;
    this.paymentMessage = null;
    this.paymentMessageType = null;
    this.cdr.markForCheck();
  }

  onConfirmPay(): void {
    if (!this.confirmPayId) return;

    const reservationId = this.confirmPayId;
    this.confirmPayId = null;
    this.paymentLoading = reservationId;
    this.paymentMessage = null;
    this.paymentMessageType = null;
    this.cdr.markForCheck();

    this.paymentsService.simulatePayment(reservationId).subscribe({
      next: (response) => {
        this.paymentLoading = null;

        if (response.paymentStatus === 'APPROVED') {
          this.paymentMessage = 'Pago aprobado. Tu reserva está confirmada.';
          this.paymentMessageType = 'success';
          // Update local state to CONFIRMED
          this.reservations = this.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'CONFIRMED' as const } : r
          );
        } else if (response.paymentStatus === 'REJECTED') {
          this.paymentMessage = 'El pago fue rechazado. Puedes intentarlo de nuevo.';
          this.paymentMessageType = 'warning';
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.paymentLoading = null;
        this.paymentMessage = 'Error al procesar el pago. Intenta de nuevo más tarde.';
        this.paymentMessageType = 'error';
        this.cdr.markForCheck();
      },
    });
  }

  onDismissPayDialog(): void {
    this.confirmPayId = null;
    this.cdr.markForCheck();
  }

  onCancel(reservationId: string): void {
    this.confirmCancelId = reservationId;
    this.cdr.markForCheck();
  }

  onConfirmCancel(): void {
    if (!this.confirmCancelId) return;

    const reservationId = this.confirmCancelId;
    this.confirmCancelId = null;
    this.cancelLoading = reservationId;
    this.cdr.markForCheck();

    this.reservationsService.cancelReservation(reservationId).subscribe({
      next: () => {
        this.cancelLoading = null;
        this.reservations = this.reservations.map((r) =>
          r.id === reservationId ? { ...r, status: 'CANCELLED' as const } : r
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.cancelLoading = null;
        this.paymentMessage = 'Error al cancelar la reserva. Intenta de nuevo más tarde.';
        this.paymentMessageType = 'error';
        this.cdr.markForCheck();
      },
    });
  }

  onDismissCancelDialog(): void {
    this.confirmCancelId = null;
    this.cdr.markForCheck();
  }

  getReservationForPay(): ReservationResponse | undefined {
    return this.reservations.find((r) => r.id === this.confirmPayId);
  }
}
