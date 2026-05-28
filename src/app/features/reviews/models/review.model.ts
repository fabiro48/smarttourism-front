export interface ReviewResponse {
  id: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  experienceId: string;
  experienceTitle: string;
  rating: number;          // 1-5
  comment: string | null;
  createdAt: string;       // ISO 8601
}

export interface ReviewRequest {
  experienceId: string;
  rating: number;          // 1-5
  comment?: string | null;
}
