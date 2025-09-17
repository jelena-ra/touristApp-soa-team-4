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

    constructor(private tourService: TourService,
        private destroyRef: DestroyRef
    ) {}

    ngOnInit(): void {
        this.getAllTours()
    }

    getAllTours(): void {
        this.tourService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response) => {
            this.tours = response
        })
    }

    openCreateTour(): void {
        // TODO provera da li je korisnik ulogovan i da li je autor

        const dialogRef = this.dialog.open(CreateTourDialog);

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                console.log(result)
                this.tours = [...this.tours, result]
            }
        })
    }
}