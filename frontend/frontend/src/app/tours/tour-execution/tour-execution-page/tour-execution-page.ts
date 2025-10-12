import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MapComponent } from '../../../shared/map/map.component'; // Ispravi putanju ako treba
import { TourExecutionService } from '../../services/tour-execution.service';
import { TourExecution, Location } from '../../model/tour-execution.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material/material.module';
import { KeyPointInterface } from '../../model/key-point.interface';
import { TourService } from '../../services/tour.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-tour-execution-page',
  standalone: true,
  imports: [CommonModule, MapComponent, MaterialModule, MatProgressBarModule],
  templateUrl: './tour-execution-page.html',
  styleUrls: ['./tour-execution-page.css']
})
export class TourExecutionPageComponent implements OnInit, OnDestroy {
  activeTour: TourExecution | null = null;
  private pollingSubscription?: Subscription;
  currentLocation: Location = { latitude: 0, longitude: 0 };
  keyPoints: KeyPointInterface[] = []; 
  private touristId: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourExecutionService: TourExecutionService,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const tourId = this.route.snapshot.paramMap.get('id');
    if (!tourId) {
  
      this.router.navigate(['/tours']);
      return;
    }
     this.startAndLoadTour(tourId);
     this.authService.getUser().subscribe(user => {
            this.touristId = user.id;
            console.log('Trenutni korisnik:', this.touristId);
        });
  }

 startAndLoadTour(tourId: string): void {

  navigator.geolocation.getCurrentPosition(position => {
    this.currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
 
    this.tourExecutionService.startTour(tourId, this.currentLocation, this.touristId).subscribe({
      next: (execution) => {

        this.activeTour = execution;
        this.tourService.getById(execution.tourId).subscribe({
          next: (tourDetails) => {
            
            if (this.activeTour) {
       
            }
            this.keyPoints = tourDetails.keyPoints || [];

            console.log('Tura uspešno pokrenuta i detalji učitani:', this.activeTour);
            
          
            this.startPolling();
          },
          error: (err) => {
            console.error('Greška pri učitavanju detalja ture:', err);
            this.router.navigate(['/tours']);
          }
        });
      },
      error: (err) => {
        console.error('Greška pri pokretanju ture:', err);
        this.router.navigate(['/tours']);
      }
    });
  });
}

   onLocationSelected(event: { latitude: number, longitude: number }): void {
    this.currentLocation = {
      latitude: event.latitude,
      longitude: event.longitude
    };
    this.snackBar.open('Lokacija ažurirana!', 'OK', { duration: 2000 });
    
    // Opciono: Možemo odmah pokrenuti proveru, ne čekajući tajmer
    // this.checkProximityNow(); 
  }


  startPolling(): void {
    this.pollingSubscription = timer(0, 10000).pipe( 
      switchMap(() => {
    
        console.log('Provera blizine za lokaciju:', this.currentLocation);
        return this.tourExecutionService.checkProximity(this.activeTour!.id, this.currentLocation, this.touristId);
      })
    ).subscribe({
      next: (updatedExecution) => {
        console.log('Odgovor od servera:', updatedExecution);
        
    
        if (this.activeTour && updatedExecution.completedKeyPoints.length > this.activeTour.completedKeyPoints.length) {
          this.snackBar.open('Stigli ste do nove ključne tačke!', 'Bravo!', { duration: 3000 });
        }
        
        this.activeTour = updatedExecution;

    
        if (updatedExecution.status === 'Completed') {
          this.snackBar.open('Čestitamo! Uspešno ste završili turu!', 'OK', { duration: 5000 });
          this.stopPolling();
          this.router.navigate(['/tours']); 
        }
      },
      error: (err) => console.error('Greška pri proveri blizine:', err)
    });
  }

  abandonTour(): void {

    if (!this.activeTour) {
      console.error('Nema aktivne ture za napuštanje.');
      return;
    }

    if (confirm('Da li ste sigurni da želite da napustite turu?')) {

      this.tourExecutionService.abandonTour(this.activeTour.id, this.touristId).subscribe({
        next: (updatedExecution) => {
          console.log('Tura je uspešno napuštena:', updatedExecution);
    
          this.snackBar.open('Tura je napuštena.', 'OK', { duration: 3000 });
    
          this.stopPolling();
      
          this.router.navigate(['/tours']);
        },
        error: (err) => {
          console.error('Greška pri napuštanju ture:', err);
          this.snackBar.open('Došlo je do greške. Pokušajte ponovo.', 'Zatvori', { duration: 3000 });
        }
      });
    }
  }

   stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}