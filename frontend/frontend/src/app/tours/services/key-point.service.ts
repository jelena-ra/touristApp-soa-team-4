import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { KeyPointInterface } from "../model/key-point.interface";

@Injectable({
    providedIn: 'root'
})
export class KeyPointService {
    private url: string = 'http://localhost:8000/api/key-point'

    constructor(private http: HttpClient) {}

    createKeyPoint(newKeyPoint: KeyPointInterface) : Observable<KeyPointInterface> {
        console.log(newKeyPoint)
        return this.http.post<{ keyPoint:KeyPointInterface }>(this.url, { keyPoint: newKeyPoint})
        .pipe(
            map(response => response.keyPoint)
        )
    }
}