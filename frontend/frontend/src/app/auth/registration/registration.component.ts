import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Registration } from '../model/registration.model';
import { AuthService } from '../auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterLink } from '@angular/router'; // <-- Dodaj RouterLink
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'xp-registration',
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatRadioModule,
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'] 
})
export class RegistrationComponent {
  
  showPassword = false;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  registrationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('turista', [Validators.required]),
  });

  register(): void {
    if (this.registrationForm.invalid) {
      return;
    }

 
    const registration: Registration = this.registrationForm.value as Registration;

    this.authService.register(registration).subscribe({
        next: () => {
          // alert('Korisnik je ulogovan!'); 
          // Umesto alert-a, preusmeravamo korisnika
          this.router.navigate(['/login']); // Preusmeri na stranicu za prijavu nakon uspešne registracije
        },  
        error: (err) => {
          this.snackBar.open('Došlo je do greške prilikom registracije. Pokušajte ponovo.', 'Zatvori', {
            duration: 5000,
          });
        } 
      });
  }
}