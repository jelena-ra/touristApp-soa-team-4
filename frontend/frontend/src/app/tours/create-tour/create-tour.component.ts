import { Component, DestroyRef, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TourDifficulty, TourInterface, TourTag } from "../model/tour.interface";
import { MatDialogModule } from "@angular/material/dialog";
import { MaterialModule } from "../../material/material.module";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { TourService } from "../services/tour.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { MatRadioModule } from '@angular/material/radio';
import { MatChipListbox, MatChipOption } from "@angular/material/chips";
import { AuthService } from "../../auth/auth.service";

@Component({
    selector: 'create-tour',
    templateUrl: './create-tour.component.html',
    styleUrl: './create-tour.component.scss',
    imports: [
    MatDialogModule,
    MaterialModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatRadioModule,
    MatChipListbox,
    MatChipOption
]
})
export class CreateTourDialog {
    readonly dialogRef = inject(MatDialogRef<CreateTourDialog>);

    constructor (
        private tourService: TourService,
        private destroyRef: DestroyRef,
        private authService: AuthService
    ) {}
    authorId: string = "";

    newTour: TourInterface = {
        id: '',
        authorId: '',
        name: '',
        description: '',
        difficulty: "EASY",
        keyPoints: [],
        price: 0,
        status: "DRAFT",
        tags: []
    }

    difficulties: TourDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
    tags: TourTag[] = [
        'Nature',
        'Historical',
        'Adventure',
        'Cultural',
        'Wildlife',
        'Relaxation',
        'Beach',
        'Mountain',
        'Urban'
    ]
    ngOnInit(): void {
        this.authService.getUser().subscribe(user => {
            this.authorId = user.id;
            this.newTour.authorId = this.authorId;
            console.log('Trenutni korisnik:', this.authorId);
        });
    }

    createTour(): void {
    
        if (!this.newTour.authorId) {
            console.error('Nema autora, nema ni ture hehe.');
            return;
        }

        console.log(this.newTour)
        this.tourService.createTour(this.newTour)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result: TourInterface) => {
            this.dialogRef.close(result)
        })
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}