import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:8081';
  private controllerPath = "";

  constructor(private http: HttpClient) { }

  setControllerPath(path: string): void {
    if (this.controllerPath == "") {
      this.controllerPath = path;
      this.apiUrl = this.apiUrl + this.controllerPath;
    } else if (this.controllerPath !== path) {
      this.controllerPath = path;
      this.apiUrl = 'http://localhost:8081';
      this.apiUrl = this.apiUrl + this.controllerPath;
    }
  }

  uploadImage(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<number>(this.apiUrl, formData).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' }).pipe(
      tap((response) => {
      }),
      catchError((error: HttpErrorResponse) => {
        
        return throwError(() => error);
      })
    );
  }
}