import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ImageService } from '../image/image.service';
import { TokenStorage

 } from '../auth/jwt/token.service';
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
export interface Profile {
  userId: string;
  name: string;
  surname: string;
  imageURL: string;
  biography: string;
  moto: string;
 money:number;
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
  user: User | null = null;
  loading = true;
  error = false;
  profileImageSrc: string | null = null;

  constructor( private destroyRef: DestroyRef,
        private snackBar: MatSnackBar,
        private tourExecutionService: TourExecutionService,private http: HttpClient,private tourService: TourService,   private imageService: ImageService,private authService: TokenStorage,  private auth: AuthService ) {}



  ngOnInit() {
    this.auth.getUser().subscribe((user: User) => {
            this.userId = user.id;
            this.user = user;
            console.log('Trenutni korisnik:', this.userId);
            console.log('Trenutni korisnik:', this.user);
        });
    this.getAllTours()
    this.getProfile();
  }

  getProfile(){
    
    const token = this.authService.getAccessToken();
    this.http.get<Profile>(`http://localhost:8000/api/profile/${this.userId}`, { headers: {
        'Authorization': `Bearer ${token}`
      } }).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.imageService.setControllerPath('/images'); 
       this.profileImageSrc = `http://localhost:8081/image/${this.profile.imageURL}`;
       
       
      },
      error: (err) => {
        console.error('Greška pri učitavanju profila:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }


    getAllTours(): void {
        this.tourService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response) => {
            this.userTours = response
            this.checkActiveExecution();
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
}
