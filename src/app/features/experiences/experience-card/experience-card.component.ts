import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ExperienceResponse } from '../models/experience.model';

@Component({
  selector: 'app-experience-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './experience-card.component.html',
  styleUrl: './experience-card.component.scss',
})
export class ExperienceCardComponent {
  @Input() experience!: ExperienceResponse;
  @Input() isAdmin: boolean = false;
  @Output() deactivate = new EventEmitter<string>();

  constructor(private router: Router) {}

  get difficultyClass(): string {
    switch (this.experience.difficulty) {
      case 'EASY':
        return 'badge-easy';
      case 'MODERATE':
        return 'badge-moderate';
      case 'HARD':
        return 'badge-hard';
      case 'EXTREME':
        return 'badge-extreme';
      default:
        return '';
    }
  }

  get difficultyLabel(): string {
    switch (this.experience.difficulty) {
      case 'EASY':
        return 'Fácil';
      case 'MODERATE':
        return 'Moderada';
      case 'HARD':
        return 'Difícil';
      case 'EXTREME':
        return 'Extrema';
      default:
        return '';
    }
  }

  navigateToDetail(): void {
    this.router.navigate(['/experiences', this.experience.id]);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/experiences', this.experience.id, 'edit']);
  }

  onDeactivate(event: Event): void {
    event.stopPropagation();
    this.deactivate.emit(this.experience.id);
  }
}
