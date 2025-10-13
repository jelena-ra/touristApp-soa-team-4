import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { TourInterface } from "../model/tour.interface";
import { TourService } from "../services/tour.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from '@angular/material/chips';
import { MatButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CreateTourDialog } from "../create-tour/create-tour.component";
import { MatDialogModule } from "@angular/material/dialog";
import { TourExecution } from "../model/tour-execution.interface";
import { TourExecutionService } from "../services/tour-execution.service";
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from "../../auth/auth.service";
import { User } from "../../auth/model/user.model";

@Component({
    selector: 'view-tours',
    templateUrl: './view-tours.component.html',
    styleUrl: './view-tours.component.scss',
    imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    CommonModule,
    MatCardSubtitle,
    MatCardContent,
    MatChipsModule,
    MatCardActions,
    MatButton,
    RouterLink,
    MatDialogModule
]
})
export class ViewToursPage implements OnInit{
    tours: TourInterface[] = []
    readonly dialog = inject(MatDialog);
    activeExecution: TourExecution | null = null;
    private userId: string = "";
     user: User | null = null;

    constructor(private tourService: TourService,
        private destroyRef: DestroyRef,
        private tourExecutionService: TourExecutionService,
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

    openCreateTour(): void {
        // TODO provera da li je korisnik ulogovan i da li je autor
        if(this.userId === '' || this.userId === '0') {
            alert('You must be logged in to create a tour.');
            return;
        }
        const dialogRef = this.dialog.open(CreateTourDialog);

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                console.log(result)
                this.tours = [...this.tours, result]
            }
        })
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