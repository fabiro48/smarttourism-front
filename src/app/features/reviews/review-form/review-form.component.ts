import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewRequest, ReviewResponse } from '../models/review.model';
import { ReviewsService } from '../services/reviews.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule, StarRatingComponent],
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent {
  @Input() experienceId!: string;
  @Output() reviewCreated = new EventEmitter<ReviewResponse>();

  rating = 0;
  comment = '';
  isSubmitting = false;
  errorMessage = '';
  isHidden = false;

  private reviewsService = inject(ReviewsService);

  onRatingChange(value: number): void {
    this.rating = value;
  }

  onSubmit(): void {
    if (this.rating === 0 || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: ReviewRequest = {
      experienceId: this.experienceId,
      rating: this.rating,
      comment: this.comment || null
    };

    this.reviewsService.createReview(request).subscribe({
      next: (review) => {
        this.reviewCreated.emit(review);
        this.rating = 0;
        this.comment = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 403) {
          this.errorMessage = 'Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña';
        } else if (err.status === 409) {
          this.errorMessage = 'Ya has dejado una reseña para esta experiencia';
          this.isHidden = true;
        } else {
          this.errorMessage = 'Error al enviar la reseña. Intenta de nuevo más tarde';
        }
      }
    });
  }
}
