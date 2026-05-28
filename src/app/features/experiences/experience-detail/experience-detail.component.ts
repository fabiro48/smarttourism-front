import { Component, OnInit, ViewChild, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ExperiencesService } from '../services/experiences.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExperienceResponse } from '../models/experience.model';
import { ReviewListComponent } from '../../reviews/review-list/review-list.component';
import { ReviewFormComponent } from '../../reviews/review-form/review-form.component';
import { ReviewStatisticsComponent } from '../../reviews/review-statistics/review-statistics.component';
import { ReviewResponse } from '../../reviews/models/review.model';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-experience-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReviewListComponent, ReviewFormComponent, ReviewStatisticsComponent, MapComponent],
  templateUrl: './experience-detail.component.html',
  styleUrl: './experience-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceDetailComponent implements OnInit {
  @ViewChild('reviewList') reviewList!: ReviewListComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private experiencesService = inject(ExperiencesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  experience: ExperienceResponse | null = null;
  isLoading = false;
  errorMessage = '';
  notFound = false;
  selectedScheduleId = '';

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  get isTourist(): boolean {
    return this.authService.getUserRole() === 'TOURIST';
  }

  get canReserve(): boolean {
    return this.isTourist && !!this.experience && this.experience.schedules.length > 0 && !!this.selectedScheduleId;
  }

  onReserve(): void {
    if (!this.experience || !this.selectedScheduleId) return;
    const schedule = this.experience.schedules.find(s => s.id === this.selectedScheduleId);
    this.router.navigate(['/reservations/new'], {
      queryParams: {
        experienceId: this.experience.id,
        scheduleId: this.selectedScheduleId,
        experienceTitle: this.experience.title,
        pricePerPerson: this.experience.price,
        scheduleInfo: schedule ? `${schedule.dayOfWeek} ${schedule.startTime} - ${schedule.endTime}` : '',
      },
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    this.isLoading = true;

    this.experiencesService.getExperienceById(id).subscribe({
      next: (data) => {
        this.experience = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.notFound = true;
        } else {
          this.errorMessage = 'Error al cargar la experiencia. Intenta de nuevo más tarde';
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onReviewCreated(review: ReviewResponse): void {
    if (this.reviewList) {
      this.reviewList.addReview(review);
    }
    if (this.experience) {
      this.experience.reviewCount++;
      const oldCount = this.experience.reviewCount - 1;
      const oldAvg = this.experience.averageRating ?? 0;
      this.experience.averageRating = (oldAvg * oldCount + review.rating) / this.experience.reviewCount;
      this.cdr.markForCheck();
    }
  }
}
