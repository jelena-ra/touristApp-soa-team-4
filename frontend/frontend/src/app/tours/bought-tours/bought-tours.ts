import { Component } from '@angular/core';
import { TourInterface } from '../model/tour.interface';
import { TourExecution } from '../model/tour-execution.interface';
import { User } from '../../auth/model/user.model';
import { TourService } from '../services/tour.service';
import { TourExecutionService } from '../services/tour-execution.service';
import { AuthService } from '../../auth/auth.service';
import { PurchaseService } from '../../purchase/service/purchase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from '@angular/material/chips';

@Component({
  standalone:true,
  selector: 'app-bought-tours',
  templateUrl: './bought-tours.html',
  styleUrl: './bought-tours.css',
  imports: [
  MatButton,
  RouterLink,
   MatCard,
    MatCardHeader,
    MatCardTitle,
    CommonModule,
    MatCardSubtitle,
    MatCardContent,
    MatChipsModule,
    MatCardActions
  ]
})
export class BoughtTours {
 tours: TourInterface[] = []

   activeExecution: TourExecution | null = null;
    private userId: string = "";
     user: User | null = null;

    constructor(private tourService: TourService,
        private destroyRef: DestroyRef,
        private snackBar: MatSnackBar,
        private tourExecutionService: TourExecutionService,
        private purchaseService: PurchaseService,
        private authService: AuthService
    ) {}

      ngOnInit(): void {
        this.getAllTours()
        this.authService.getUser().subscribe(user => {
            this.userId = user.id;
            this.user = user;
            console.log('Trenutni korisnik:', this.userId);
            console.log('Trenutni korisnik:', this.user);
        });
    }

     getAllTours(): void {
        this.tourService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response) => {
            this.tours = response
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
