import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ImageService } from '../image/image.service';
import { TokenStorage

 } from '../auth/jwt/token.service';
export interface Profile {
  userId: string;
  name: string;
  surname: string;
  imageURL: string;
  biography: string;
  moto: string;
}
@Component({
  selector: 'app-profile',
   standalone: true, 
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
   imports: [
    CommonModule
  ]
})



export class ProfileComponent implements OnInit {
profile: Profile | null = null;

  loading = true;
  error = false;
  profileImageSrc: string | null = null;

  constructor(private http: HttpClient,   private imageService: ImageService,private authService: TokenStorage ) {}



  ngOnInit() {
      const token = this.authService.getAccessToken();

    this.http.get<Profile>('http://localhost:8000/api/profile/2', { headers: {
        'Authorization': `Bearer ${token}`
      } }).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.imageService.setControllerPath('/images'); 
       this.profileImageSrc = `http://localhost:8081/image/filename/${this.profile.imageURL}`;
       
       
      },
      error: (err) => {
        console.error('Greška pri učitavanju profila:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
