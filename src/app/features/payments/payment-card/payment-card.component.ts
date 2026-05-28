import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentResponse, PaymentStatus } from '../../reservations/models/reservation.model';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './payment-card.component.html',
  styleUrl: './payment-card.component.scss',
})
export class PaymentCardComponent {
  @Input() payment!: PaymentResponse;

  get statusLabel(): string {
    switch (this.payment.paymentStatus) {
      case 'APPROVED':
        return 'Aprobado';
      case 'REJECTED':
        return 'Rechazado';
      case 'PENDING':
        return 'Pendiente';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return '';
    }
  }

  get statusClass(): string {
    switch (this.payment.paymentStatus) {
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'PENDING':
        return 'status-pending';
      case 'EXPIRED':
        return 'status-expired';
      default:
        return '';
    }
  }

  get displayTitle(): string {
    return this.payment.experienceTitle?.trim()
      ? this.payment.experienceTitle
      : 'Experiencia no disponible';
  }
}
