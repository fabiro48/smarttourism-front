import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsService } from '../services/payments.service';
import { ReservationsService } from '../../reservations/services/reservations.service';
import {
  PaymentResponse,
  ReservationResponse,
} from '../../reservations/models/reservation.model';
import { PaymentCardComponent } from '../payment-card/payment-card.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, PaymentCardComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private reservationsService = inject(ReservationsService);
  private cdr = inject(ChangeDetectorRef);

  payments: PaymentResponse[] = [];
  pendingReservations: ReservationResponse[] = [];
  isLoading = false;
  errorMessage = '';
  paymentLoading: string | null = null;
  confirmPayId: string | null = null;
  paymentMessage: string | null = null;
  paymentMessageType: 'success' | 'warning' | 'error' | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.paymentsService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments = payments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage =
          'Error al cargar el historial de pagos. Intenta de nuevo más tarde.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });

    this.reservationsService.getMyReservations().subscribe({
      next: (reservations) => {
        this.pendingReservations = reservations.filter(
          (r) => r.status === 'PENDING_PAYMENT'
        );
        this.cdr.markForCheck();
      },
      error: () => {
        // Silently handle reservation fetch errors; pending section simply won't show
        this.pendingReservations = [];
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
          // Update local reservation status to CONFIRMED and remove from pending section
          this.pendingReservations = this.pendingReservations
            .map((r) =>
              r.id === reservationId ? { ...r, status: 'CONFIRMED' as const } : r
            )
            .filter((r) => r.status === 'PENDING_PAYMENT');
          this.refreshPaymentHistory();
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

  getReservationForPay(): ReservationResponse | undefined {
    return this.pendingReservations.find((r) => r.id === this.confirmPayId);
  }

  private refreshPaymentHistory(): void {
    this.paymentsService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments = payments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.cdr.markForCheck();
      },
      error: () => {
        // Silently handle refresh errors; existing list remains
      },
    });
  }
}
