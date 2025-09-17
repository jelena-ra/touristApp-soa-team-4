import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TourService } from "../services/tour.service";
import { TourInterface } from "../model/tour.interface";
import { KeyPointInterface } from "../model/key-point.interface";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TourExecutionModule } from "../../tour-execution/tour-execution.module";
import { MapComponent } from "../../shared/map/map.component";
import { KeyPointService } from "../services/key-point.service";
import { MaterialModule } from "../../material/material.module";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'tour-details',
    templateUrl: './tour-details.component.html',
    styleUrl: './tour-details.component.scss',
    imports: [
        CommonModule,
        TourExecutionModule,
        MapComponent,
        MaterialModule,
        FormsModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourDetailsPage implements OnInit{
    tour!: TourInterface;
    newKeyPoint: KeyPointInterface = {
        id: '',
        tourID: '',
        name: '',
        description: '',
        latitude: 0,
        longitude: 0,
        imageID: '',
        order: 0
    }

    constructor(
        private tourService: TourService,
        private keyPointService: KeyPointService,
        private destroyRef: DestroyRef,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.getTour()
    }

    getTour(): void {
        const tourId = this.route.snapshot.paramMap.get('id');
        if (!tourId) return;
        
        this.tourService.getById(tourId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((tour: TourInterface) => {
                this.tour = tour;
                this.tour.keyPoints = tour.keyPoints || [];
                this.newKeyPoint.tourID = tour.id
        });
    }

    onLocationSelected(event: { latitude: number, longitude: number }) {
        this.newKeyPoint.latitude = event.latitude
        this.newKeyPoint.longitude = event.longitude
    }

    createKeyPoint(): void {
        this.keyPointService.createKeyPoint(this.newKeyPoint)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response: KeyPointInterface ) => {
            this.tour.keyPoints = [...this.tour.keyPoints, response];

            this.newKeyPoint = {
                id: '',
                tourID: this.tour.id,
                name: '',
                description: '',
                latitude: 0,
                longitude: 0,
                imageID: '',
                order: 0
            }
        })
    }

    cancelCreate(): void {
        this.newKeyPoint = {
            id: '',
            tourID: this.tour.id,
            name: '',
            description: '',
            latitude: 0,
            longitude: 0,
            imageID: '',
            order: 0
        }
    }
}