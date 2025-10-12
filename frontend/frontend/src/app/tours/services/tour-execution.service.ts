import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TourExecution, Location } from '../model/tour-execution.interface';
import { TokenStorage } from '../../auth/jwt/token.service';

@Injectable({
  providedIn: 'root'
})
export class TourExecutionService {
  private url: string = 'http://localhost:8000/api/tour-executions';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage // <-- Ubaci TokenStorage
  ) { }

  /**
   * Pokreće novu sesiju ture.
   * @param tourId ID ture koja se pokreće.
   * @param startPosition Početna pozicija turiste.
   */
  startTour(tourId: string, startPosition: Location, touristId: string): Observable<TourExecution> {
    // 1. Dobavi token
    const token = this.tokenStorage.getAccessToken();

    // 2. Kreiraj hedere
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Pošalji zahtev sa hederima
    return this.http.post<TourExecution>(
      `${this.url}/${tourId}`, 
      startPosition,
      { headers: headers } // <-- Dodaj hedere kao opciju
    );
  }

  /**
   * Proverava blizinu ključnih tačaka na osnovu trenutne pozicije turiste.
   * @param executionId ID aktivne sesije ture.
   * @param currentPosition Trenutna pozicija turiste.
   */
  checkProximity(executionId: string, currentPosition: Location, touristId: string): Observable<TourExecution> {
    // 1. Dobavi token
    const token = this.tokenStorage.getAccessToken();

    // 2. Kreiraj hedere
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Pošalji zahtev sa hederima
    return this.http.put<TourExecution>(
      `${this.url}/${executionId}/check-proximity`, 
      currentPosition,
      { headers: headers } // <-- Dodaj hedere kao opciju
    );
  }

  /**
   * Prekida (napušta) aktivnu sesiju ture.
   * @param executionId ID aktivne sesije ture.
   */
  abandonTour(executionId: string, touristId: string): Observable<TourExecution> {
    // 1. Dobavi token
    const token = this.tokenStorage.getAccessToken();

    // 2. Kreiraj hedere
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Pošalji zahtev sa hederima
    return this.http.put<TourExecution>(
      `${this.url}/${executionId}/abandon`, 
      {}, // Prazno telo zahteva
      { headers: headers } // <-- Dodaj hedere kao opciju
    );
  }

  /**
   * Dobavlja aktivnu sesiju ture za ulogovanog korisnika.
   */
  getActiveTour(): Observable<TourExecution> {
    // 1. Dobavi token
    const token = this.tokenStorage.getAccessToken();

    // 2. Kreiraj hedere
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Pošalji zahtev sa hederima
    return this.http.get<TourExecution>(
      `${this.url}/active`,
      { headers: headers } // <-- Dodaj hedere kao opciju
    );
  }
}





















// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { TourExecution, Location } from '../model/tour-execution.interface';

// @Injectable({
//   providedIn: 'root'
// })
// export class TourExecutionService {
//   // Definišemo putanju do našeg API-ja.
//   // Pretpostavka je da TourExecution endpointi slušaju na portu 8084 (HTTP)
//   // ili da ih API Gateway preusmerava sa porta 8000.
//   // Prilagodite putanju ako je potrebno.
//     private url: string = 'http://localhost:8000/api/tour-executions'


//   constructor(private http: HttpClient) { }

//   /**
//    * Pokreće novu sesiju ture.
//    * @param tourId ID ture koja se pokreće.
//    * @param startPosition Početna pozicija turiste.
//    */
//   startTour(tourId: string, startPosition: Location): Observable<TourExecution> {
//     // Šaljemo POST zahtev na /api/tour-executions/{tourId}
//     // U telu zahteva šaljemo početnu poziciju.
//     return this.http.post<TourExecution>(`${this.url}/${tourId}`, startPosition);
//   }

//   /**
//    * Proverava blizinu ključnih tačaka na osnovu trenutne pozicije turiste.
//    * @param executionId ID aktivne sesije ture.
//    * @param currentPosition Trenutna pozicija turiste.
//    */
//   checkProximity(executionId: string, currentPosition: Location): Observable<TourExecution> {
//     // Šaljemo PUT zahtev na /api/tour-executions/{id}/check-proximity
//     return this.http.put<TourExecution>(`${this.url}/${executionId}/check-proximity`, currentPosition);
//   }

//   /**
//    * Prekida (napušta) aktivnu sesiju ture.
//    * @param executionId ID aktivne sesije ture.
//    */
//   // abandonTour(executionId: string): Observable<TourExecution> {
//   //   // Šaljemo PUT zahtev na /api/tour-executions/{id}/abandon
//   //   return this.http.put<TourExecution>(`${this.apiPath}/${executionId}/abandon`, {});
//   // }

//   // /**
//   //  * Dobavlja aktivnu sesiju ture za ulogovanog korisnika.
//   //  */
//   // getActiveTour(): Observable<TourExecution> {
//   //   // Šaljemo GET zahtev na /api/tour-executions/active
//   //   return this.http.get<TourExecution>(`${this.apiPath}/active`);
//   // }
// }