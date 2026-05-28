import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExperienceCardComponent } from '../experience-card/experience-card.component';
import { ExperiencesService } from '../services/experiences.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ExperienceFilters,
  ExperienceResponse,
} from '../models/experience.model';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ExperienceCardComponent],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperiencesComponent implements OnInit {
  private experiencesService = inject(ExperiencesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  experiences: ExperienceResponse[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;
  filters: ExperienceFilters = {};
  isAdmin = false;
  confirmDeleteId: string | null = null;

  get rangeStart(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';
    this.loadExperiences();
  }

  loadExperiences(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.experiencesService
      .getExperiences(this.filters, this.currentPage, this.pageSize)
      .subscribe({
        next: (page) => {
          this.experiences = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage =
            'Error al cargar las experiencias. Intenta de nuevo más tarde';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadExperiences();
  }

  onClearFilters(): void {
    this.filters = {};
    this.currentPage = 0;
    this.loadExperiences();
  }

  onNextPage(): void {
    this.currentPage++;
    this.loadExperiences();
  }

  onPrevPage(): void {
    this.currentPage--;
    this.loadExperiences();
  }

  onDeactivate(id: string): void {
    this.confirmDeleteId = id;
  }

  onConfirmDelete(): void {
    if (!this.confirmDeleteId) return;

    const idToDelete = this.confirmDeleteId;
    this.confirmDeleteId = null;

    this.experiencesService.deleteExperience(idToDelete).subscribe({
      next: () => {
        this.experiences = this.experiences.filter((e) => e.id !== idToDelete);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage =
          'Error al desactivar la experiencia. Intenta de nuevo más tarde';
        this.cdr.markForCheck();
      },
    });
  }

  onCancelDelete(): void {
    this.confirmDeleteId = null;
  }
}
