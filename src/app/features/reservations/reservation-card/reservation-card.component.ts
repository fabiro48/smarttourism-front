import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReservationResponse, ReservationStatus } from '../models/reservation.model';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './reservation-card.component.html',
  styleUrl: './reservation-card.component.scss',
})
export class ReservationCardComponent {
  @Input() reservation!: ReservationResponse;
  @Input() paymentLoading = false;
  @Input() cancelLoading = false;
  @Output() pay = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  get statusLabel(): string {
    switch (this.reservation.status) {
      case 'PENDING_PAYMENT':
        return 'Pendiente de pago';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'EXPIRED':
        return 'Expirada';
      case 'NO_SHOW':
        return 'No asistió';
      default:
        return '';
    }
  }

  get statusClass(): string {
    switch (this.reservation.status) {
      case 'PENDING_PAYMENT':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'EXPIRED':
      case 'NO_SHOW':
        return 'status-error';
      default:
        return '';
    }
  }

  get showPayButton(): boolean {
    return this.reservation.status === 'PENDING_PAYMENT';
  }

  get showCancelButton(): boolean {
    return this.reservation.status === 'PENDING_PAYMENT' || this.reservation.status === 'CONFIRMED';
  }

  get showExpiration(): boolean {
    return this.reservation.status === 'PENDING_PAYMENT';
  }

  onPay(): void {
    this.pay.emit(this.reservation.id);
  }

  onCancel(): void {
    this.cancel.emit(this.reservation.id);
  }
}
