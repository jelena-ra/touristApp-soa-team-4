import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router'; // <-- Dodaj RouterLink
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'xp-login', // Promenjeno iz 'xp-registration'
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    RouterLink, // <-- Dodaj RouterLink
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // <-- Promenjeno u .scss
})
export class LoginComponent {

  showPassword = false; // <-- Dodata promenljiva

  constructor(private authService: AuthService, private router: Router) {}

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData = {
      username: this.loginForm.value.username || "",
      password: this.loginForm.value.password || "",
    };

    this.authService.login(loginData).subscribe({
        next: () => {
          // alert('Korisnik je ulogovan!'); 
          // Umesto alert-a, preusmeravamo korisnika
          this.router.navigate(['/home']); // Preusmeri na početnu stranu nakon uspešnog logina
        },  
        error: (err) => {
          console.error('Greška pri logovanju:', err);
          // Ovde bi trebalo prikazati poruku korisniku, npr. preko snack-bar-a
          // da su kredencijali pogrešni.
        }
      });
  }
}