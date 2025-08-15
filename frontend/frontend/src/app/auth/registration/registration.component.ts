import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common'; // Potreban za ngIf
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Registration } from '../model/registration.model';
import { AuthService } from '../auth.service';




@Component({
  standalone: true,
  selector: 'xp-registration',
  imports: [ReactiveFormsModule, MatSnackBarModule, CommonModule, HttpClientModule,  MatButtonModule, 
    MatInputModule,  
    MatFormFieldModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  constructor(private authService: AuthService) {}

  registrationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  register(): void {
    const registration: Registration = {
      name: this.registrationForm.value.name || "",
      surname: this.registrationForm.value.surname || "",
      email: this.registrationForm.value.email || "",
      username: this.registrationForm.value.username || "",
      password: this.registrationForm.value.password || "",
    };

    this.authService.register(registration).subscribe({
        next: () => alert('Korisnik registrovan!'),
        error: (err) => console.error('Greška pri registraciji:', err)
      });

  }
}

//     if (this.registrationForm.valid) {
//       this.authService.register(registration).subscribe({
//         next: () => {
//           this.router.navigate(['/explore-tours']);
//           this.notificationService.notify({ message:'Registration successful', duration: 3000, notificationType: NotificationType.SUCCESS });
//         },error: (error) => {
//           this.notificationService.notify({ message:'Registration failed', duration: 3000, notificationType: NotificationType.WARNING });
//         }
//       });
//     }
//   }
// }