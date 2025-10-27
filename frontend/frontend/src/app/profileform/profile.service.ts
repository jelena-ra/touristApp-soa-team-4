// profile.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorage } from '../auth/jwt/token.service';

export interface Profile {
  userId: string;
  name: string;
  surname: string;
  biography: string;
  moto: string;
  photoId: string; 
  money: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private baseUrl = 'http://localhost:8000/api/profile';

  constructor(private http: HttpClient, private authService: TokenStorage) {}

  createProfile(profile: Profile): Observable<Profile> {
       const token = this.authService.getAccessToken();
    return this.http.post<Profile>(this.baseUrl, profile, { headers: {
        'Authorization': `Bearer ${token}`
      } });
  }
   updateProfile(profile: Profile): Observable<Profile> {
       const token = this.authService.getAccessToken();
    return this.http.post<Profile>('http://localhost:8000/api/profile-update', profile, { headers: {
        'Authorization': `Bearer ${token}`
      } });
  }

  getProfileByUserId(userId: string): Observable<Profile> {
    const token = this.authService.getAccessToken();
    return this.http.get<Profile>(`${this.baseUrl}/${userId}`, { headers: {
        'Authorization': `Bearer ${token}`
      } });
  }
}
