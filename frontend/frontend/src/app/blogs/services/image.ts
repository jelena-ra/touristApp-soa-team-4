import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageUploadResponse {
  fileName: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

    uploadImage(blogId: string, file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    const uploadUrl = `${this.apiUrl}/blogs/${blogId}/images`;
    return this.http.post<ImageUploadResponse>(uploadUrl, formData);
  }
}