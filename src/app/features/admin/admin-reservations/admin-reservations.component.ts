import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationsService } from '../../reservations/services/reservations.service';
import { ReservationResponse, ReservationStatus, AdminReservationFilters } from '../../reservations/models/reservation.model';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservations.component.html',
  styleUrl: './admin-reservations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsComponent implements OnInit {
  private reservationsService = inject(ReservationsService);
  private cdr = inject(ChangeDetectorRef);

  reservations: ReservationResponse[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  // Filters
  selectedStatus: ReservationStatus | '' = '';
  startDate = '';
  endDate = '';

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: AdminReservationFilters = {};
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }
    if (this.startDate) {
      filters.startDate = this.startDate;
    }
    if (this.endDate) {
      filters.endDate = this.endDate;
    }

    this.reservationsService
      .getAdminReservations(filters, this.currentPage, this.pageSize)
      .subscribe({
        next: (page) => {
          this.reservations = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Error al cargar las reservas. Intenta de nuevo más tarde';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadReservations();
  }

  onNextPage(): void {
    this.currentPage++;
    this.loadReservations();
  }

  onPrevPage(): void {
    this.currentPage--;
    this.loadReservations();
  }

  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
      NO_SHOW: 'No asistió',
    };
    return labels[status];
  }
}
