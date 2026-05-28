import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() readonly: boolean = true;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];

  onStarClick(value: number): void {
    if (this.readonly) return;
    this.rating = value;
    this.ratingChange.emit(value);
  }

  onStarHover(value: number): void {
    if (this.readonly) return;
    this.hoverRating = value;
  }

  onStarLeave(): void {
    this.hoverRating = 0;
  }

  onArrowRight(): void {
    if (this.readonly) return;
    if (this.rating < 5) {
      this.rating++;
      this.ratingChange.emit(this.rating);
    }
  }

  onArrowLeft(): void {
    if (this.readonly) return;
    if (this.rating > 1) {
      this.rating--;
      this.ratingChange.emit(this.rating);
    }
  }
}
