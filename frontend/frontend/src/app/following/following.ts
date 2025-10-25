import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../auth/model/user.model';

export interface FollowPayload {
  followerId: string;
  followedId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FollowingService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getRecommendations(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/recommendations/${userId}`);
  }

  followUser(payload: FollowPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/follow`, payload);
  }

  checkIfFollowing(followerId: string, followedId: string): Observable<{ follows: boolean }> {
    return this.http.get<{ follows: boolean }>(`${this.apiUrl}/follow/exists/${followerId}/${followedId}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getFollowings(userId: string): Observable<{ ids: string[] }> {
    return this.http.get<{ ids: string[] }>(`${this.apiUrl}/followings/${userId}`);
  }
}