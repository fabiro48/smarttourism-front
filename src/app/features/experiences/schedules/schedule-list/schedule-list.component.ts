import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SchedulesService } from '../services/schedules.service';
import { ScheduleResponse, sortSchedules } from '../models/schedule.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmationDialogComponent],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private schedulesService = inject(SchedulesService);
  private cdr = inject(ChangeDetectorRef);

  schedules: ScheduleResponse[] = [];
  isLoading = false;
  errorMessage = '';
  experienceId = '';

  // Delete confirmation state
  deleteScheduleId: string | null = null;
  deleteScheduleInfo = '';
  isDeleting = false;

  ngOnInit(): void {
    this.experienceId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.experienceId) {
      this.router.navigate(['/experiences']);
      return;
    }
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.schedulesService.getSchedules(this.experienceId).subscribe({
      next: (data) => {
        this.schedules = sortSchedules(data);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.router.navigate(['/experiences']);
          return;
        }
        this.errorMessage = err.error?.message
          ?? 'Error al cargar los horarios. Intenta de nuevo más tarde.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onDelete(schedule: ScheduleResponse): void {
    this.deleteScheduleId = schedule.id;
    this.deleteScheduleInfo = `${schedule.dayOfWeek} ${schedule.startTime} - ${schedule.endTime}`;
  }

  onConfirmDelete(): void {
    if (!this.deleteScheduleId) return;

    this.isDeleting = true;
    this.cdr.markForCheck();

    this.schedulesService.deleteSchedule(this.experienceId, this.deleteScheduleId).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(s => s.id !== this.deleteScheduleId);
        this.deleteScheduleId = null;
        this.deleteScheduleInfo = '';
        this.isDeleting = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error?.message
          ?? 'Error al desactivar el horario. Intenta de nuevo más tarde.';
        this.deleteScheduleId = null;
        this.deleteScheduleInfo = '';
        this.isDeleting = false;
        this.cdr.markForCheck();
      },
    });
  }

  onCancelDelete(): void {
    this.deleteScheduleId = null;
    this.deleteScheduleInfo = '';
  }
}
