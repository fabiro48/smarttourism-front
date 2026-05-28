import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ExperiencesService } from '../services/experiences.service';
import { ExperienceResponse } from '../models/experience.model';

@Component({
  selector: 'app-experience-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './experience-detail.component.html',
  styleUrl: './experience-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private experiencesService = inject(ExperiencesService);
  private cdr = inject(ChangeDetectorRef);

  experience: ExperienceResponse | null = null;
  isLoading = false;
  errorMessage = '';
  notFound = false;

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
}
