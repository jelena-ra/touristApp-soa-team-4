import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorage } from './jwt/token.service';
//import { environment } from 'src/env/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Login } from './model/login.model';
import { AuthenticationResponse } from './model/authentication-response.model';
import { User } from './model/user.model';
import { Registration } from './model/registration.model';
import { ErrorHandlerService } from '../shared/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = new BehaviorSubject<User>({ username: "", id: '0', role: "" });

  constructor(private http: HttpClient,
    private tokenStorage: TokenStorage,
    private errorHandler: ErrorHandlerService,
    private router: Router) { }


//     register(registration: Registration): Observable<AuthenticationResponse> {
//     return this.http
//       .post<AuthenticationResponse>(`http://localhost:8081/api/users`, registration)
//       .pipe(
//         tap((authenticationResponse) => {
//           // Ovaj dio koda pretpostavlja da backend vraća JWT.
//           // Ovdje trebate provjeriti kako točno vaš backend vraća token
//           // i prilagoditi spremanje. Na primjer:
//           // this.tokenStorage.saveJwtToken(authenticationResponse.jwt);
//           // this.setUser(); // Postavljanje korisničkih podataka
//         }),
//         catchError((error: HttpErrorResponse) => {
//           // Vaša logika za rukovanje greškama
//           console.error('Došlo je do greške prilikom registracije:', error.message);
//           // this.errorHandler.handleHttpError(error);
//           return throwError(() => error);
//         })
//       );
//   }

    register(registration: Registration): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`http://localhost:8000/api/users`, registration)
      .pipe(
        tap((authenticationResponse) => {
         
          //this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          //this.setUser();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Došlo je do greške prilikom registracije:', error.message);
         this.errorHandler.handleHttpError(error);
         return throwError(() => error);
        })
      );
  }

  private setUser(): void {
    const jwtHelperService = new JwtHelperService();
    const accessToken = this.tokenStorage.getAccessToken() || "";
    const user: User = {
      id: jwtHelperService.decodeToken(accessToken).id,
      username: jwtHelperService.decodeToken(accessToken).username,
      role: jwtHelperService.decodeToken(accessToken).role
    };
    this.user$.next(user);
  }

  public getUser(): Observable<User> {
    const jwtHelperService = new JwtHelperService();
    const accessToken = this.tokenStorage.getAccessToken() || "";
    const user: User = {
      id: jwtHelperService.decodeToken(accessToken).id,
      username: jwtHelperService.decodeToken(accessToken).username,
      role: jwtHelperService.decodeToken(accessToken).role
    };
     this.user$.next(user);
    return this.user$;
  }

  login(login: Login): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`http://localhost:8000/api/users/login`, login)
      .pipe(
        tap((authenticationResponse) => {
          this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          this.setUser();
        }),
        catchError((error: HttpErrorResponse) => {
          this.errorHandler.handleHttpError(error); 
          return throwError(() => error);
        })
      );
  }

    logout(): void {
    this.router.navigate(['/home']).then(_ => {
      this.tokenStorage.clear();
      this.user$.next({ username: "", id: '0', role: "" });
    });
  }

//   register(registration: Registration): Observable<AuthenticationResponse> {
//     return this.http
//       .post<AuthenticationResponse>(environment.apiHost + 'users', registration)
//       .pipe(
//         tap((authenticationResponse) => {
//           this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
//           this.setUser();
//         }),
//         catchError((error: HttpErrorResponse) => {
//           this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
//           return throwError(() => error);
//         })
//       );
//   }

//   logout(): void {
//     this.router.navigate(['/home']).then(_ => {
//       this.tokenStorage.clear();
//       this.user$.next({ username: "", id: 0, role: "" });
//     }
//     );
//   }

//   checkIfUserExists(): void {
//     const accessToken = this.tokenStorage.getAccessToken();
//     if (accessToken == null) {
//       return;
//     }
//     this.setUser();
//   }

//   private setUser(): void {
//     const jwtHelperService = new JwtHelperService();
//     const accessToken = this.tokenStorage.getAccessToken() || "";
//     const user: User = {
//       id: +jwtHelperService.decodeToken(accessToken).id,
//       username: jwtHelperService.decodeToken(accessToken).username,
//       role: jwtHelperService.decodeToken(accessToken)[
//         'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
//       ],
//     };
//     this.user$.next(user);
//   }

//   getUsernameT(id: number): Observable<string> {
//     return this.http.get<string>('https://localhost:44333/api/user/tourist/getUsername', {
//       params: {
//         userId: id.toString()
//       },
//       responseType: 'text' as 'json'
//     }).pipe(
//       tap((response) => {
//       }),
//       catchError((error: HttpErrorResponse) => {
//         this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
//         return throwError(() => error);
//       })
//     );
//   }

//   getUsernameAu(id: number): Observable<string> {
//     return this.http.get<string>('https://localhost:44333/api/user/author/getUsername', {
//       params: {
//         userId: id.toString()
//       },
//       responseType: 'text' as 'json'
//     }).pipe(
//       tap((response) => {
//       }),
//       catchError((error: HttpErrorResponse) => {
//         this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
//         return throwError(() => error);
//       })
//     );
//   }

//   getUsernameAd(id: number): Observable<string> {
//     return this.http.get<string>('https://localhost:44333/api/administrator/users/getUsername', {
//       params: {
//         userId: id.toString()
//       },
//       responseType: 'text' as 'json'
//     }).pipe(
//       tap((response) => {
//       }),
//       catchError((error: HttpErrorResponse) => {
//         this.errorHandler.handleHttpError(error); // Delegiranje grešaka ErrorHandlerService-u
//         return throwError(() => error);
//       })
//     );
//   }


 checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();

    if (!accessToken) {
      return;
    }
    const jwtHelper = new JwtHelperService();
    if (jwtHelper.isTokenExpired(accessToken)) {
      console.log("Pronađen je token, ali je istekao. Logout.");
      this.logout();
    } else {
      console.log("Pronađen je validan token, postavljam korisnika.");
      this.setUser();
    }
  }

}
