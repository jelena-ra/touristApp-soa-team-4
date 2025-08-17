import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '../shared/map/map.component';

@Component({
  selector: 'app-home',
  imports: [MapComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
    constructor(private router: Router) {}

  createProfile(): void {
    this.router.navigate(['create-profile']);
  }

  seeProfile(): void {
    this.router.navigate(['profile']);
  }

   registration(): void {
    this.router.navigate(['registration']);
  }
  login(): void {
    this.router.navigate(['login']);
  }
  simulator(): void {
    this.router.navigate(['tourist-location']);
  }
}
