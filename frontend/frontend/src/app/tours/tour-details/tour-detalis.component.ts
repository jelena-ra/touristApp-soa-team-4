import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TourService } from "../services/tour.service";
import { TourDifficulty, TourInterface, TourTag } from "../model/tour.interface";
import { KeyPointInterface } from "../model/key-point.interface";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TourExecutionModule } from "../../tour-execution/tour-execution.module";
import { MapComponent } from "../../shared/map/map.component";
import { KeyPointService } from "../services/key-point.service";
import { MaterialModule } from "../../material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatChipOption, MatChipListbox } from "@angular/material/chips";
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'tour-details',
    templateUrl: './tour-details.component.html',
    styleUrls: ['./tour-details.component.scss'],
    imports: [
    CommonModule,
    TourExecutionModule,
    MapComponent,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipOption,
    MatChipListbox
]
})
export class TourDetailsPage implements OnInit {
    private _snackBar = inject(MatSnackBar);

    tour!: TourInterface;
    editableTour!: TourInterface;
    tagSelection: TourTag[] = [];

    newKeyPoint: KeyPointInterface = {
        id: '',
        tourID: '',
        name: '',
        description: '',
        latitude: 0,
        longitude: 0,
        imageUrl: '',
        order: 0
    };
    selectedFile: File | null = null;

    editMode = false;

    difficulties: TourDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
    tags: TourTag[] = [
        'Nature', 'Historical', 'Adventure', 'Cultural',
        'Wildlife', 'Relaxation', 'Beach', 'Mountain', 'Urban'
    ];
    filePreview: string | null = null;

    constructor(
        private tourService: TourService,
        private keyPointService: KeyPointService,
        private destroyRef: DestroyRef,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.getTour();
    }

    getTour(): void {
        const tourId = this.route.snapshot.paramMap.get('id');
        if (!tourId) return;

        this.tourService.getById(tourId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((tour: TourInterface) => {
                this.tour = tour;
                this.tour.keyPoints = tour.keyPoints || [];
                this.newKeyPoint.tourID = tour.id;
                this.editableTour = JSON.parse(JSON.stringify(this.tour));
                this.tagSelection = [...this.editableTour.tags];
            });
    }

    // ✅ Getters/Setters za dvosmerno vezivanje
    get tourName() { return this.editableTour.name; }
    set tourName(value: string) { this.editableTour.name = value; }

    get tourDescription() { return this.editableTour.description; }
    set tourDescription(value: string) { this.editableTour.description = value; }

    get tourDifficulty() { return this.editableTour.difficulty; }
    set tourDifficulty(value: TourDifficulty) { this.editableTour.difficulty = value; }

    get tourTags() { return this.editableTour.tags }
    set tourTags(value: TourTag[]) { if (this.editMode) this.editableTour.tags = value; }

    saveTour() {
        if (!this.editableTour) return;

        this.editableTour.tags = this.tagSelection;

        this.tourService.update(this.editableTour)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (updatedTour) => {
                    this._snackBar.open('Tour updated', 'OK', { duration: 2000 });
                    this.editMode = false;
                    this.getTour();
                },
                error: (err) => {
                    console.error('Update error:', err);
                    this._snackBar.open('Failed to update tour', 'OK', { duration: 2000 });
                }
            });
    }

    startEdit() {
        if (!this.tour) return;
        this.editableTour = JSON.parse(JSON.stringify(this.tour));
        this.tagSelection = [...this.editableTour.tags];
        this.editMode = true;
    }

    cancelEdit() {
        this.editMode = false;
        this.editableTour = JSON.parse(JSON.stringify(this.tour));
        this.tagSelection = [...this.tour.tags];
        this.cdr.detectChanges(); 
    }

    onLocationSelected(event: { latitude: number, longitude: number }) {
        this.newKeyPoint.latitude = event.latitude;
        this.newKeyPoint.longitude = event.longitude;
    }

    createKeyPoint(): void {
        if (!this.newKeyPoint.latitude || !this.newKeyPoint.longitude) {
            this._snackBar.open("Please select a location on the map", "OK", { duration: 2000 });
            return;
        }

        if (!this.newKeyPoint.name || !this.newKeyPoint.description) {
            this._snackBar.open("Key Point name and description are required", "OK", { duration: 2000 });
            return;
        }

        if (!this.selectedFile) {
            this._snackBar.open("Please select an image", "OK", { duration: 2000 });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            this.keyPointService.createKeyPoint(this.newKeyPoint, base64String)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(response => {
                    this.tour.keyPoints = [...this.tour.keyPoints, response];
                    this._snackBar.open("Key Point Created", "OK", { duration: 2000 });
                    this.cancelCreate();
                });
        };
        reader.readAsDataURL(this.selectedFile);
    }

    cancelCreate(): void {
        this.newKeyPoint = {
            id: '',
            tourID: this.tour.id,
            name: '',
            description: '',
            latitude: 0,
            longitude: 0,
            imageUrl: '',
            order: 0
        };
        this.selectedFile = null;
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        this.selectedFile = input.files[0];
        this.filePreview = URL.createObjectURL(this.selectedFile);
    }

    publishTour() {
        this.tourService.publish(this.tour.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
            next: (response) => {

            },
            error: (err) => {
                console.log(err)
            }
        })
    }

    archiveTour() {
        this.tourService.archive(this.tour.id);
    }

    get sortedKeyPoints() {
        return (this.tour?.keyPoints || []).slice().sort((a, b) => a.order - b.order);
    }

    onTagsChanged(event: any) {
        this.tagSelection = event.source.selectedOptions.selected.map((s: any) => s.value);
    }
}