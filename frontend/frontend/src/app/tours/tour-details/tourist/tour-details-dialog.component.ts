import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TourInterface, Transport } from '../../model/tour.interface';
import { MatIcon } from "@angular/material/icon";
import { MatChip, MatChipListbox, MatChipOption, MatChipSet } from "@angular/material/chips";
import { MatCard, MatCardContent, MatCardTitle } from "@angular/material/card";
import { MapComponent } from "../../../shared/map/map.component";

@Component({
  selector: 'app-tour-details-dialog',
  templateUrl: './tour-details-dialog.component.html',
  styleUrls: ['./tour-details-dialog.component.scss'],
  imports: [MatDialogContent, MatIcon, MatChip, MatDialogActions, MatCard, MatCardContent, MatCardTitle, MatChipOption, MatChipSet, MapComponent]
})
export class TourDetailsDialogComponent {
  transportIcons: Record<Transport, string> = {
    WALKING: 'directions_walk',
    BICYCLE: 'directions_bike',
    CAR: 'directions_car'
  };

  constructor(public dialogRef: MatDialogRef<TourDetailsDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) 
    public data: { tour: TourInterface; bought: boolean }) {}
}
