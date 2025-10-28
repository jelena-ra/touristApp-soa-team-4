import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../services/tour.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// Potrebno za ikone zvezdica
import { MatIconModule } from '@angular/material/icon';

// Definišemo model koji očekujemo da dobijemo od servisa
export interface Recension {
  id: string;
  authorId: string;
  tourId: string;
  rating: number;
  visitDate: string;
  comment: string;
  createdAt: string;
  pictures: string[]; // Niz URL-ova do slika
}

// Proširujemo model za potrebe prikaza (da pamtimo koja je slika aktivna)
export interface DisplayRecension extends Recension {
  currentImageIndex: number;
}

@Component({
  selector: 'app-recension-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './recension-list.html',
  styleUrls: ['./recension-list.css']
})
export class RecensionListComponent implements OnInit {
  @Input() tourId!: string;
  @Output() close = new EventEmitter<void>();

  recensions$!: Observable<DisplayRecension[]>;
  readonly imageBaseUrl = 'http://localhost:8000';

  constructor(private tourService: TourService) { }

  ngOnInit(): void {
    if (this.tourId) {
      this.recensions$ = this.tourService.getRecensionsForTour(this.tourId).pipe(
        map(response => {
          return response.recensions.map((rec: Recension) => ({
            ...rec,
            currentImageIndex: 0
          }));
        })
      );
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  prevImage(recension: DisplayRecension): void {
    if (recension.currentImageIndex > 0) {
      recension.currentImageIndex--;
    }
  }

  nextImage(recension: DisplayRecension): void {
    if (recension.pictures && recension.currentImageIndex < recension.pictures.length - 1) {
      recension.currentImageIndex++;
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}