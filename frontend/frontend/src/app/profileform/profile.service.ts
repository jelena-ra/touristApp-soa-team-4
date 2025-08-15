// profile.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Profile {
  userId: string;
  name: string;
  surname: string;
  biography: string;
  moto: string;
  imageURL: string; // ovo je imageID
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = 'http://localhost:8081/profile';

  constructor(private http: HttpClient) {}

  createProfile(profile: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.baseUrl, profile);
  }
}
