import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ImageService } from '../image/image.service';
import { TokenStorage

 } from '../auth/jwt/token.service';
 import { switchMap, map } from 'rxjs/operators';
 import { User } from '../auth/model/user.model';
 import { AuthService } from '../auth/auth.service';
 import { MatIconModule } from '@angular/material/icon';
 import { TourService } from '../tours/services/tour.service';
 import { TourInterface } from '../tours/model/tour.interface';
import { TourExecution } from '../tours/model/tour-execution.interface';
import { TourExecutionService } from '../tours/services/tour-execution.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from "@angular/material/card";
import { MatChipsModule } from '@angular/material/chips';
import { PurchaseService } from '../purchase/service/purchase.service';
import { TourDetailsDialogComponent } from '../tours/tour-details/tourist/tour-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
export interface Profile {
  userId: string;
  name: string;
  surname: string;
  photoId: string;
  biography: string;
  moto: string;
 money:number;
}


export interface TourPurchaseToken  {
	id : string;  
	UserID : string;
	tour_id : string;
	Token : string;
}


@Component({
  selector: 'app-profile',
   standalone: true, 
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
   imports: [
    CommonModule,
    MatIconModule,
     MatButton,
  RouterLink,
   MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatChipsModule,
    MatCardActions
  ]
})

export class ProfileComponent implements OnInit {
  userTours: TourInterface[] = []
  
     activeExecution: TourExecution | null = null;
profile: Profile | null = null;
  private userId: string = "";
  userTokens: TourPurchaseToken[] = [];  
  user: User | null = null;
  loading = true;
  error = false;
  profileImageSrc: string | null = null;
  readonly dialog = inject(MatDialog);

  constructor( private destroyRef: DestroyRef,
        private snackBar: MatSnackBar,
        private tourExecutionService: TourExecutionService,private http: HttpClient,private tourService: TourService,  private purchaseService: PurchaseService, private imageService: ImageService,private authService: TokenStorage,  private auth: AuthService ) {}



  ngOnInit() {
    this.auth.getUser().subscribe((user: User) => {
            this.userId = user.id;
            this.user = user;
            console.log('Trenutni korisnik:', this.userId);
            console.log('Trenutni korisnik:', this.user);
        });
    this.loadUserToursWithTokens()
    this.getProfile();
  }

  getProfile(){
    
    const token = this.authService.getAccessToken();
    this.http.get<Profile>(`http://localhost:8000/api/profile/${this.userId}`, { headers: {
        'Authorization': `Bearer ${token}`
      } }).subscribe({
      next: (data) => {
        console.log("PPPORFIL: ", data)
        this.profile = data;
        this.loading = false;
        this.imageService.setControllerPath('/images'); 
       this.profileImageSrc = `http://localhost:8000/api/image/${this.profile.photoId}`;
       
       
      },
      error: (err) => {
        console.error('Greška pri učitavanju profila:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }


   /* getAllTours(): void {
        this.purchaseService.getTokens(this.userId).pipe(takeUntilDestroyed(this.destroyRef))
        this.tourService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response) => {
            this.userTours = response
            this.checkActiveExecution();
            });
    }*/
  private loadUserToursWithTokens(): void {
      this.purchaseService.getTokens(this.userId).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((tokens: TourPurchaseToken[]) => {
        this.userTokens = tokens; 
        console.log("Tokens: ", tokens)
        if (tokens.length === 0) {
          return of([]);
        }

        const tourIdsFromTokens = tokens.map(token => token. tour_id);
       
        const uniqueTourIds = [...new Set(tourIdsFromTokens)];

      
        return this.tourService.getAll().pipe(
          map((allTours: TourInterface[]) => {
            console.log("AllTours: ", allTours)
            return allTours.filter(tour => uniqueTourIds.includes(tour.id));
          }),
          catchError(error => {
            console.error('Error fetching all tours:', error);
    
            return of([]);
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching user tokens:', error);
    
        return of([]);
      })
    ).subscribe((filteredTours: TourInterface[]) => {
      this.userTours = filteredTours;
      this.checkActiveExecution();
      console.log('User-specific tours loaded:', this.userTours);
    });
  }



    checkActiveExecution(): void {
        this.tourExecutionService.getActiveTour().pipe(
        
            catchError(error => of(null)) 
        ).subscribe(execution => {
            this.activeExecution = execution;
            console.log('Aktivna tura:', this.activeExecution);
        });
    }

    openTourDetailsDialog(tour: TourInterface): void {
            if (!tour) return;
            this.tourService.getById(tour.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response) => {
                this.dialog.open(TourDetailsDialogComponent, {
                    data: response
                });
              }
            })

        }
}
