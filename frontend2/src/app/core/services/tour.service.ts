import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour, TourForm, Review, ReviewForm, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/tours`);
  }

  getTour(id: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/tours/${id}`);
  }

  createTour(tourData: TourForm): Observable<ApiResponse<Tour>> {
    return this.http.post<ApiResponse<Tour>>(`${this.apiUrl}/tours`, tourData);
  }

  updateTour(id: string, tourData: TourForm): Observable<ApiResponse<Tour>> {
    return this.http.put<ApiResponse<Tour>>(`${this.apiUrl}/tours/${id}`, tourData);
  }

  deleteTour(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/tours/${id}`);
  }

  getTourReviews(tourId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/tours/${tourId}/reviews`);
  }

  createReview(tourId: string, reviewData: ReviewForm): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/tours/${tourId}/reviews`, reviewData);
  }

  deleteReview(tourId: string, reviewId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/tours/${tourId}/reviews/${reviewId}`);
  }

  searchTours(query: string, filters?: any): Observable<PaginatedResponse<Tour>> {
    const params = { q: query, ...filters };
    return this.http.get<PaginatedResponse<Tour>>(`${this.apiUrl}/tours/search`, { params });
  }
}