import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, ProfileForm, Follow, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateProfile(profileData: ProfileForm): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, profileData);
  }

  uploadProfileImage(file: File): Observable<ApiResponse<{ profileImage: string }>> {
    const formData = new FormData();
    formData.append('profileImage', file);
    return this.http.post<ApiResponse<{ profileImage: string }>>(`${this.apiUrl}/profile/image`, formData);
  }

  getFollows(): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.apiUrl}/follows`);
  }

  followUser(userId: string): Observable<ApiResponse<Follow>> {
    return this.http.post<ApiResponse<Follow>>(`${this.apiUrl}/follows`, { followedId: userId });
  }

  unfollowUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/follows/${userId}`);
  }

  getFollowers(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/${userId}/followers`);
  }

  getFollowing(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/${userId}/following`);
  }
}