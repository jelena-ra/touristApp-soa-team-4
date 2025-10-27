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
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selectedFile: File | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private keyPointService: KeyPointService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
      const keyPointData = result.data;
      const file: File | null = result.file;

      if (isNew) {
        if (!file) {
          this.snackBar.open('Morate izabrati sliku za novu ključnu tačku.', 'OK', { duration: 3000 });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          this.keyPointService.createKeyPoint(keyPointData, base64String).subscribe({
            next: (createdKP) => {
              this.tour!.keyPoints = [...this.tour!.keyPoints, createdKP];
              this.snackBar.open("Ključna tačka uspešno kreirana.", "OK", { duration: 2000 });
            },
            error: (err) => {
              console.error("Greška pri kreiranju ključne tačke:", err);
              this.snackBar.open("Došlo je do greške pri kreiranju.", "Zatvori", { duration: 3000 });
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
    this.snackBar.open("Key Point Ažuriran", "OK", { duration: 2000 });
  }
}