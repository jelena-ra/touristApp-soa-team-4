import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { KeyPointInterface } from "../model/key-point.interface";
import { TokenStorage } from "../../auth/jwt/token.service";

@Injectable({
    providedIn: 'root'
})
export class KeyPointService {
    private url: string = 'http://localhost:8000/api/key-point'

    constructor(private http: HttpClient,  private tokenStorage: TokenStorage ) {}
      private getHeaders(): HttpHeaders {
        const token = this.tokenStorage.getAccessToken();
        return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }

    createKeyPoint(newKeyPoint: KeyPointInterface, imageBase64: string) : Observable<KeyPointInterface> {
        return this.http.post<{ keyPoint: KeyPointInterface }>(
            'http://localhost:8000/api/key-point',
            { keyPoint: newKeyPoint, imageBase64 }
        ).pipe(
            map(res => res.keyPoint)
        );
    }

    deleteKeyPoint(keyPointId: string): Observable<unknown> {
        return this.http.delete<unknown>(
            `${this.url}/${keyPointId}`, 
            { headers: this.getHeaders() }
        );
    }

     updateKeyPoint(keyPoint: KeyPointInterface, imageBase64: string): Observable<KeyPointInterface> {
        return this.http.put<{ keyPoint: KeyPointInterface }>(
            this.url, 
            { keyPoint: keyPoint, imageBase64: imageBase64 }, 
            { headers: this.getHeaders() }
        ).pipe(
            map(response => response.keyPoint)
        );
    }
}