// ─── Enums ────────────────────────────────────────────────────────────────────

export type ReservationStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface ReservationRequest {
  experienceId: string;
  scheduleId: string;
  reservationDate: string;  // formato ISO: yyyy-MM-dd
  quantity: number;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface ReservationResponse {
  id: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  experienceId: string;
  experienceTitle: string;
  experienceLocation: string;
  scheduleId: string;
  reservationDate: string;      // yyyy-MM-dd
  quantity: number;
  totalAmount: number;
  status: ReservationStatus;
  expirationDate: string;       // ISO datetime
  createdAt: string;            // ISO datetime
  updatedAt: string;            // ISO datetime
}

export interface PaymentResponse {
  id: string;
  paymentStatus: PaymentStatus;
  transactionReference: string;
  amount: number;
  reservationId: string;
  reservationStatus: ReservationStatus;
  touristId: string;
  touristName: string;
  touristEmail: string;
  experienceId: string;
  experienceTitle: string;
  experienceLocation: string;
  reservationDate: string;
  quantity: number;
  totalAmount: number;
  expirationDate: string;
  createdAt: string;
}

// ─── Filtros Admin ────────────────────────────────────────────────────────────

export interface AdminReservationFilters {
  status?: ReservationStatus | null;
  experienceId?: string | null;
  startDate?: string | null;    // yyyy-MM-dd
  endDate?: string | null;      // yyyy-MM-dd
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // página actual (0-indexed)
  size: number;
}
