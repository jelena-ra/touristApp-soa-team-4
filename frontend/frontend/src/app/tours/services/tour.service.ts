import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { TourInterface } from "../model/tour.interface";
import { KeyPointInterface } from "../model/key-point.interface";

@Injectable({
    providedIn: 'root'
})
export class TourService {
    private url: string = 'http://localhost:8000/api/tours'

    constructor(private http: HttpClient) {}

    getAll() : Observable<TourInterface[]> {
        return this.http.get<{ tours: TourInterface[] }>(this.url)
        .pipe(
            map(response => response.tours)
        )
    }

    getById(tourId: string): Observable<TourInterface> {
    return this.http.get<{ tour: TourInterface; keyPoints: KeyPointInterface[] }>(`${this.url}/${tourId}`)
        .pipe(
            map(response => {
                return {
                ...response.tour,
                keyPoints: response.keyPoints
                };
            })
        );
    }

    createTour(newTour: TourInterface) : Observable<TourInterface> {
        return this.http.post<{ tour:TourInterface }>(this.url, { tour:newTour})
            .pipe(
                map(response => response.tour)
            )
    }
}