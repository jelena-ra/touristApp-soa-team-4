import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TourService } from "../services/tour.service";
import { TourDifficulty, TourInterface, TourTag, Transport } from "../model/tour.interface";
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
import { MatDialog } from "@angular/material/dialog";
import { KeyPointDialog, KeyPointDialogData } from "../key-points-dialog/key-point-dialog/key-point-dialog";
import { AuthService } from "../../auth/auth.service";
import { User } from "../../auth/model/user.model";
import { TourPurchaseToken } from "../../profile/profile";
import { PurchaseService } from "../../purchase/service/purchase.service";
import { catchError, map, of, switchMap } from "rxjs";
import { TourExecutionService } from "../services/tour-execution.service";

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
    transportIcons: any = {
        WALKING: 'directions_walk',   // Material Icon
        BICYCLE: 'directions_bike',
        CAR: 'directions_car'
    };

    private _snackBar = inject(MatSnackBar);

    @ViewChild(MapComponent) mapComponent!: MapComponent;

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
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    selectedFile: File | null = null;

    editMode = false;

    difficulties: TourDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
    tags: TourTag[] = [
        'Nature', 'Historical', 'Adventure', 'Cultural',
        'Wildlife', 'Relaxation', 'Beach', 'Mountain', 'Urban'
    ];
    filePreview: string | null = null;

    lastRouteDistanceKm: number | null = null;
    lastRouteDurationByTransport: Record<Transport, string> | null = null;

    constructor(
        private tourService: TourService,
        private keyPointService: KeyPointService,
        private destroyRef: DestroyRef,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private auth: AuthService,
        private purchaseService: PurchaseService,
        private tourExecutionService: TourExecutionService
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

    get tourPrice() { return this.editableTour.price; }
    set tourPrice(value: number) { this.editableTour.price = value; }

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
        this.filePreview = null;

        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
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
                this._snackBar.open(response, "OK", {duration:2000})
                this.getTour();
            },
            error: (err) => {
                console.log(err)
            }
        })
    }

    archiveTour() {
        this.tourService.archive(this.tour.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
            next: (response) => {
                this._snackBar.open(response, "OK", {duration:2000})
                this.getTour();
            },
            error: (err) => {
                console.log(err)
            }
        })
    }

    get sortedKeyPoints() {
        return (this.tour?.keyPoints || []).slice().sort((a, b) => a.order - b.order);
    }

    onTagsChanged(event: any) {
        this.tagSelection = event.source.selectedOptions.selected.map((s: any) => s.value);
    }

    onRouteCalculated(payload: { distanceKm: number, durationByTransport: Record<Transport, string> | null}) {
        this.lastRouteDistanceKm = payload.distanceKm;
        this.lastRouteDurationByTransport = payload.durationByTransport;

        this._snackBar.open(`Route: ${payload.distanceKm.toFixed(2)} km`, 'OK', { duration: 2500 });

        console.log('Route calculated (parent):', payload.distanceKm, payload.durationByTransport);
    
        var update = false;
        if(this.tour.length != this.lastRouteDistanceKm) {
            this.tour.length = this.lastRouteDistanceKm
            update = true;
        }
        if(this.tour.travelTimes = this.lastRouteDurationByTransport) {
            this.tour.travelTimes = this.lastRouteDurationByTransport
            update = true;
        }

        if(update) {
            this.tourService.update(this.tour)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                error: (err) => {
                    console.log(err)
                }
            })
        }
    }

    openKeyPointDialog(isNew: boolean, keyPoint: KeyPointInterface): void {
        const dialogRef = this.dialog.open<KeyPointDialog, KeyPointDialogData>(KeyPointDialog, {
            width: '400px',
            data: { isNew, keyPoint: { ...keyPoint } }
        });

        dialogRef.afterClosed().subscribe(result => {
        if (!result || !this.tour) return;

        if (result.action === 'save') {
            const keyPointData = result.data;
            const file: File | null = result.file;

            if (isNew) {
            if (!file) {
                this._snackBar.open('Morate izabrati sliku za novu ključnu tačku.', 'OK', { duration: 3000 });
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.keyPointService.createKeyPoint(keyPointData, base64String).subscribe({
                next: (createdKP) => {
                    this.tour!.keyPoints = [...this.tour!.keyPoints, createdKP];
                    this._snackBar.open("Ključna tačka uspešno kreirana.", "OK", { duration: 2000 });
                },
                error: (err) => {
                    console.error("Greška pri kreiranju ključne tačke:", err);
                    this._snackBar.open("Došlo je do greške pri kreiranju.", "Zatvori", { duration: 3000 });
                }
                });
            };
            reader.readAsDataURL(file);

            } else {
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.keyPointService.updateKeyPoint(keyPointData, base64String).subscribe(updatedKP => {
                    this.updateKeyPointInLocalArray(updatedKP);
                });
                };
                reader.readAsDataURL(file);
            } else {
                this.keyPointService.updateKeyPoint(keyPointData, "").subscribe(updatedKP => {
                this.updateKeyPointInLocalArray(updatedKP);
                });
            }
            }
            } else if (result.action === 'delete') {
            this.keyPointService.deleteKeyPoint(result.data.id).subscribe(() => {
                    this.tour!.keyPoints = this.tour!.keyPoints.filter(kp => kp.id !== result.data.id);
                    
                    // TODO VIDI STA JE

                    this.lastRouteDistanceKm = this.mapComponent.getDistanceKm()
                    this.lastRouteDurationByTransport = this.mapComponent.getDurationByTransport()

                    // this._snackBar.open(`Route: ${this.lastRouteDistanceKm.toFixed(2)} km`, 'OK', { duration: 2500 });

                    // console.log('Route calculated (parent):', payload.distanceKm, payload.durationByTransport);
                
                    var update = false;
                    if(this.tour.length != this.lastRouteDistanceKm) {
                        this.tour.length = this.lastRouteDistanceKm
                        update = true;
                    }
                    if(this.tour.travelTimes = this.lastRouteDurationByTransport) {
                        this.tour.travelTimes = this.lastRouteDurationByTransport
                        update = true;
                    }

                    if(this.tour.keyPoints.length <= 1) {
                        update = true;
                        this.lastRouteDistanceKm = 0;
                        this.lastRouteDurationByTransport = {
                            WALKING: "",
                            BICYCLE: "",
                            CAR: ""
                        };
                        this.tour.length = this.lastRouteDistanceKm
                        this.tour.travelTimes = this.lastRouteDurationByTransport
                    }

                    if(update) {
                        this.tourService.update(this.tour)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                            error: (err) => {
                                console.log(err)
                            }
                        })
                    }
                });
            }
        });
    }

    private updateKeyPointInLocalArray(updatedKP: KeyPointInterface): void {
        if (!this.tour) return;
            const index = this.tour.keyPoints.findIndex(kp => kp.id === updatedKP.id);
        if (index > -1) {
            const updatedKeyPoints = [...this.tour.keyPoints];
            updatedKeyPoints[index] = updatedKP;
            this.tour.keyPoints = updatedKeyPoints;
        }
        this.selectedFile = null;
        this._snackBar.open("Key Point Ažuriran", "OK", { duration: 2000 });
    }

    onMarkerClicked(keyPoint: KeyPointInterface): void {
        if(this.tour.status != 'DRAFT') return;
        this.openKeyPointDialog(false, keyPoint);
    }
}