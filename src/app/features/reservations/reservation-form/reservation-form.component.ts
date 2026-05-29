import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationsService } from '../services/reservations.service';
import { ReservationRequest } from '../models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationsService = inject(ReservationsService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  experienceId = '';
  scheduleId = '';
  experienceTitle = '';
  scheduleInfo = '';
  scheduleDayOfWeek = '';
  scheduleDayLabel = '';
  unitPrice = 0;
  isSubmitting = false;
  errorMessage = '';

  /** Mapa de día de la semana en inglés a número JS (0=domingo, 1=lunes, ...) */
  private dayOfWeekMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  /** Mapa de día de la semana en inglés a español */
  private dayOfWeekLabelMap: Record<string, string> = {
    SUNDAY: 'Domingo',
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
  };

  get reservationDate() {
    return this.form.get('reservationDate')!;
  }

  get quantity() {
    return this.form.get('quantity')!;
  }

  get totalPrice(): number {
    const qty = this.form.get('quantity')?.value;
    return (qty && qty > 0) ? qty * this.unitPrice : 0;
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.experienceId = params['experienceId'] || '';
    this.scheduleId = params['scheduleId'] || '';
    this.experienceTitle = params['experienceTitle'] || '';
    this.scheduleInfo = params['scheduleInfo'] || '';
    this.unitPrice = params['pricePerPerson'] ? +params['pricePerPerson'] : 0;

    // Extraer el día de la semana del scheduleInfo (formato: "MONDAY 08:00 - 10:00")
    this.scheduleDayOfWeek = this.scheduleInfo.split(' ')[0]?.toUpperCase() || '';
    this.scheduleDayLabel = this.dayOfWeekLabelMap[this.scheduleDayOfWeek] || this.scheduleDayOfWeek;

    this.initForm();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: ReservationRequest = {
      experienceId: this.experienceId,
      scheduleId: this.scheduleId,
      reservationDate: this.form.value.reservationDate,
      quantity: this.form.value.quantity,
    };

    this.reservationsService.createReservation(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/reservations']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Error al crear la reserva. Intenta de nuevo más tarde.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      reservationDate: ['', [Validators.required, this.futureDateValidator, this.dayOfWeekValidator.bind(this)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(control.value + 'T00:00:00');
    if (selectedDate <= today) {
      return { futureDate: true };
    }
    return null;
  }

  private dayOfWeekValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.scheduleDayOfWeek) {
      return null;
    }
    const selectedDate = new Date(control.value + 'T00:00:00');
    const expectedDay = this.dayOfWeekMap[this.scheduleDayOfWeek];
    if (expectedDay === undefined) {
      return null;
    }
    if (selectedDate.getDay() !== expectedDay) {
      return { wrongDay: true };
    }
    return null;
  }
}
