import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common'; // Potreban za ngIf
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';



@Component({
  standalone: true,
  selector: 'xp-registration',
  imports: [ReactiveFormsModule, MatSnackBarModule, CommonModule, HttpClientModule,  MatButtonModule, 
    MatInputModule,  
    MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private authService: AuthService, private router: Router) {}

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  login(): void {
    const loginData = {
      username: this.loginForm.value.username || "",
      password: this.loginForm.value.password || "",
    };

    this.authService.login(loginData).subscribe({
        next: () => alert('Korisnik je ulogovan!'),  

        error: (err) => console.error('Greška pri logovanju:', err)
    });
    this.router.navigate(['home'])
  }

 
}

//     if (this.registrationForm.valid) {
//       this.authService.register(registration).subscribe({
//         next: () => {
//           this.router.navigate(['/explore-tours']);
//           this.notificationService.notify({ message:'Registration successful', duration: 3000, notificationType: NotificationType.SUCCESS });
//       password: this.loginForm.value.password || "",
//     };
//   }
// }

//     if (this.loginForm.valid) {
//       this.authService.login(loginData).subscribe({
//         next: () => {
//           this.router.navigate(['/explore-tours']);
//           this.notificationService.notify({ message:'Login successful', duration: 3000, notificationType: NotificationType.SUCCESS });
//         },error: (error) => {
//           this.notificationService.notify({ message:'Login failed', duration: 3000, notificationType: NotificationType.WARNING });
//         }
//       });
//     }
//   }
// }