// import { Component, OnInit, signal } from '@angular/core'; // <-- Dodaj OnInit
import { RouterOutlet } from '@angular/router';
import { TourExecutionModule } from './tour-execution/tour-execution.module';
import { NavbarComponent } from './layout/navbar/navbar';
import { AuthService } from './auth/auth.service';
import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true, // <-- 2. DODAJ standalone: true
  imports: [RouterOutlet, TourExecutionModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit { // <-- 3. IMPLEMENTIRAJ OnInit
  protected readonly title = signal('frontend');

  // --- 4. DODAJ KONSTRUKTOR ---
  // Ovde "ubacujemo" AuthService da bismo mogli da ga koristimo
  constructor(private authService: AuthService) {}

  // --- 5. DODAJ ngOnInit METODU ---
  // Ova metoda se izvršava jednom, kada se aplikacija pokrene
  ngOnInit(): void {
    // Pozivamo metodu koja proverava da li token postoji u localStorage-u
    this.authService.checkIfUserExists();
  }
}