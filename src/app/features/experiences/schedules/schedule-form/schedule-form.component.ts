import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SchedulesService } from '../services/schedules.service';
import { DAYS_OF_WEEK, DayOfWeek, ScheduleRequest } from '../models/schedule.model';
import { timeRangeValidator, availableSlotsValidator } from '../validators/schedule-validators';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private schedulesService = inject(SchedulesService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  mode: 'create' | 'edit' = 'create';
  scheduleId: string | null = null;
  experienceId = '';
  isSubmitting = false;
  isLoading = false;
  errorMessage = '';

  readonly daysOfWeek = DAYS_OF_WEEK;

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get dayOfWeek() {
    return this.form.get('dayOfWeek')!;
  }

  get startTime() {
    return this.form.get('startTime')!;
  }

  get endTime() {
    return this.form.get('endTime')!;
  }

  get availableSlots() {
    return this.form.get('availableSlots')!;
  }

  ngOnInit(): void {
    this.initForm();

    this.experienceId = this.route.snapshot.paramMap.get('id') || '';
    this.scheduleId = this.route.snapshot.paramMap.get('scheduleId');

    if (this.scheduleId) {
      this.mode = 'edit';
      this.loadSchedule(this.experienceId, this.scheduleId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: ScheduleRequest = {
      dayOfWeek: this.form.value.dayOfWeek,
      startTime: this.form.value.startTime,
      endTime: this.form.value.endTime,
      availableSlots: this.form.value.availableSlots,
    };

    const operation$ = this.isEditMode
      ? this.schedulesService.updateSchedule(this.experienceId, this.scheduleId!, request)
      : this.schedulesService.createSchedule(this.experienceId, request);

    operation$.subscribe({
      next: () => {
        const navigatePath = this.isEditMode ? ['../..'] : ['..'];
        this.router.navigate(navigatePath, { relativeTo: this.route });
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;

        if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Error de validación del servidor';
        } else if (err.status === 404) {
          this.errorMessage = 'El horario ya no existe';
        } else {
          this.errorMessage = 'No se pudo completar la operación. Intenta de nuevo.';
        }

        this.cdr.markForCheck();
      },
    });
  }

  private initForm(): void {
    this.form = this.fb.group(
      {
        dayOfWeek: ['', [Validators.required]],
        startTime: ['', [Validators.required]],
        endTime: ['', [Validators.required]],
        availableSlots: [null, [Validators.required, availableSlotsValidator]],
      },
      { validators: [timeRangeValidator] }
    );
  }

  private loadSchedule(experienceId: string, scheduleId: string): void {
    this.isLoading = true;

    this.schedulesService.getSchedules(experienceId).subscribe({
      next: (schedules) => {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule) {
          this.form.patchValue({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            availableSlots: schedule.availableSlots,
          });
        } else {
          this.errorMessage = 'El horario no fue encontrado';
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Error al cargar el horario para edición';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
