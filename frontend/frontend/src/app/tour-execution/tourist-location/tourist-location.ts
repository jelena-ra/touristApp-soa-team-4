import { Component, EventEmitter, Output, AfterViewInit, Input, ViewChild } from '@angular/core';
import { Location as routerLocation } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MapComponent } from '../../shared/map/map.component';
import { Location } from './location.model';

@Component({
  selector: 'xp-tourist-location',
  imports: [MapComponent],
  templateUrl: './tourist-location.html',
  styleUrls: ['./tourist-location.css'],

})
export class TouristLocationComponent implements AfterViewInit {

    @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();
   // @ViewChild(MapComponent) mapComponent: MapComponent;

    location: Location = { log: 0, lat: 0 };
    onLocationSelected(event: { latitude: number, longitude: number }): void {
     this.location.lat = event.latitude;
    this.location.log = event.longitude;
     this.locationSelected.emit({ latitude: this.location.lat, longitude: this.location.log });
     console.log('Selected location:', this.location);
    }
     ngAfterViewInit(): void {

  }
//   @Input() keyPoints: any[] = [];
//   @Input() showEncounters: boolean = false;
//   @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();
//   @ViewChild(MapComponent) mapComponent: MapComponent;

//   imageId: Number;
//   selectedFile: File;
//   previewImage: string | null = null
//   location: Location = { latitude: 0, longitude: 0 };
//   hideFinishButton: boolean = false;

//   constructor(private service: TourExecutionService, private notificationService: NotificationService, private routerLocation: routerLocation, private router: Router) {
//   }

//   ngAfterViewInit(): void {
//     this.hideFinishButton = this.router.url.includes('tourSession');
//     this.service.getTouristLocation().subscribe({
//       next: (data) => {
//         this.location.latitude = data.latitude
//         this.location.longitude = data.longitude
//         this.locationSelected.emit({ latitude: this.location.latitude, longitude: this.location.longitude });
//       },
//       error: () => {
//         // alert('Došlo je do greške prilikom ucitavanja lokacije.');
//         this.notificationService.notify({ message:'Failed to load location. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
//       }
//     });
//   }

//   goBack(): void {
//     this.routerLocation.back();
//   }

//   onLocationSelected(event: { latitude: number, longitude: number }): void {
//     this.location.latitude = event.latitude;
//     this.location.longitude = event.longitude;
//     this.locationSelected.emit({ latitude: this.location.latitude, longitude: this.location.longitude });

//     this.service.setTouristLocation(this.location).subscribe({
//       next: (data) => {
//         console.log('Lokacija kreirana!');
//         this.location.latitude = data.latitude
//         this.location.longitude = data.longitude
//         console.log(this.location.longitude + " " + this.location.latitude)
//         this.notificationService.notify({ message:'Location saved successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
//       },
//       error: () => {
//         console.log('Došlo je do greške prilikom dodavanja lokacije.');
//         this.notificationService.notify({ message:'Failed to save location. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
//       }
//     });
//   }

//   setCenter(latitude: number, longitude: number) {
//     this.mapComponent.setCenter(latitude, longitude);
//   }
}
