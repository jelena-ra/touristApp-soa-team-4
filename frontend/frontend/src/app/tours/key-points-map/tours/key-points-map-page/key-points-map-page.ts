import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TourInterface } from '../../../model/tour.interface';
import { KeyPointInterface } from '../../../model/key-point.interface';
import { TourService } from '../../../services/tour.service';
import { KeyPointService } from '../../../services/key-point.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from '../../../../shared/map/map.component';
import { MaterialModule } from '../../../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { KeyPointDialog, KeyPointDialogData } from '../../../key-points-dialog/key-point-dialog/key-point-dialog';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-key-points-map-page',
  standalone: true,
  imports: [CommonModule, MapComponent, MaterialModule, MatSpinner],
  templateUrl: './key-points-map-page.html',
  styleUrls: ['./key-points-map-page.scss']
})
export class KeyPointsMapPageComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  tour: TourInterface | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private keyPointService: KeyPointService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getTourWithKeyPoints();
  }

  getTourWithKeyPoints(): void {
    const tourId = this.route.snapshot.paramMap.get('id');
    if (!tourId) return;

    this.tourService.getById(tourId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tour => {
        this.tour = tour;
      });
  }

  onLocationSelected(event: { latitude: number, longitude: number }): void {
    if (!this.tour) return;
    const newKeyPoint: KeyPointInterface = {
      id: '',
      tourID: this.tour.id,
      name: '',
      description: '',
      latitude: event.latitude,
      longitude: event.longitude,
      imageID: '',
      order: 0
    };
    this.openKeyPointDialog(true, newKeyPoint);
  }

  onMarkerClicked(keyPoint: KeyPointInterface): void {
    this.openKeyPointDialog(false, keyPoint);
  }

  openKeyPointDialog(isNew: boolean, keyPoint: KeyPointInterface): void {
    const dialogRef = this.dialog.open<KeyPointDialog, KeyPointDialogData>(KeyPointDialog, {
      width: '400px',
      data: { isNew, keyPoint: { ...keyPoint } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !this.tour) return;

      if (result.action === 'save') {
        if (isNew) {
          this.keyPointService.createKeyPoint(result.data).subscribe(createdKP => {
            this.tour!.keyPoints = [...this.tour!.keyPoints, createdKP];
          });
        } else {
          this.keyPointService.updateKeyPoint(result.data).subscribe(updatedKP => {
             const index = this.tour!.keyPoints.findIndex(kp => kp.id === updatedKP.id);
             if (index > -1) {
               const updatedKeyPoints = [...this.tour!.keyPoints];
               updatedKeyPoints[index] = updatedKP;
               this.tour!.keyPoints = updatedKeyPoints;
             }
          });
        }
      } else if (result.action === 'delete') {
        this.keyPointService.deleteKeyPoint(result.data.id).subscribe(() => {
          this.tour!.keyPoints = this.tour!.keyPoints.filter(kp => kp.id !== result.data.id);
        });
      }
    });
  }
}