import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-review-statistics',
  standalone: true,
  imports: [DecimalPipe, StarRatingComponent],
  templateUrl: './review-statistics.component.html',
  styleUrls: ['./review-statistics.component.scss']
})
export class ReviewStatisticsComponent {
  @Input() averageRating: number | null = null;
  @Input() reviewCount: number = 0;

  get roundedRating(): number {
    return Math.round(this.averageRating ?? 0);
  }
}
