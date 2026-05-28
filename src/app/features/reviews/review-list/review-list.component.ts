import { Component, inject, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReviewResponse } from '../models/review.model';
import { ReviewsService } from '../services/reviews.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [DatePipe, StarRatingComponent],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() experienceId!: string;

  reviews: ReviewResponse[] = [];
  isLoading = true;
  errorMessage = '';

  private reviewsService = inject(ReviewsService);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reviewsService.getReviewsByExperience(this.experienceId).subscribe({
      next: (reviews) => {
        this.reviews = reviews.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar las reseñas. Intenta de nuevo más tarde';
        this.isLoading = false;
      }
    });
  }

  addReview(review: ReviewResponse): void {
    this.reviews.unshift(review);
  }
}
