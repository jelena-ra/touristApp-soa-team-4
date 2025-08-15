import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common'; // Potreban za ngIf
import { HttpClientModule } from '@angular/common/http';
import { ImageComponent } from '../image/image';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


export interface Profile {
  userId: string;
  name: string;
  surname: string;
  imageURL: string;
  biography: string;
  moto: string;
}


import { ImageService } from '../image/image.service';
import { ProfileService } from './profile.service';



@Component({
  standalone: true,
  selector: 'app-profileform',
  imports: [ReactiveFormsModule, MatSnackBarModule, CommonModule, HttpClientModule,  MatButtonModule, 
    MatInputModule,  
    MatFormFieldModule,
    ImageComponent ],
  templateUrl: './profileform.html',
  styleUrls: ['./profileform.css']
})
export class Profileform implements OnInit {
@ViewChild(ImageComponent) imageComponent!: ImageComponent;
  constructor(
    private imageService: ImageService, 
    private snackBar: MatSnackBar,
    private profileService : ProfileService

  ) { }

  @Input() profile: Profile = {
    userId: '2',
    name: '',
    surname: '',
    imageURL: '',
    biography: '',
    moto: ''
  };
  @Output() profileUpdated = new EventEmitter<string>();
  selectedFile: File | null = null;
  showImageUpload: boolean = false;
  @ViewChild('imageUploadInput') imageUploadInput!: ElementRef;

imagePreviewUrl: string | ArrayBuffer | null = null;
  user = { role: 'user' };

  userProfileForm = new FormGroup({
    userId:  new FormControl('2'), 
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    imageURL: new FormControl(''),
    biography: new FormControl(''),
    moto: new FormControl('')
  });

  ngOnInit(): void {
    this.userProfileForm.patchValue({
      userId: '2',
      name: this.profile.name,
      surname: this.profile.surname,
      imageURL: this.profile.imageURL,
      biography: this.profile.biography,
      moto: this.profile.moto
    });
  }

  

onFileSelected(file: File): void {
  this.selectedFile = file;
  console.log('Selected file:', this.selectedFile);

  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreviewUrl = reader.result;
  };
  reader.readAsDataURL(this.selectedFile);
}


  updateProfile(): void {
    if (this.userProfileForm.invalid) {
      this.snackBar.open('Molimo popunite sva obavezna polja.', 'Zatvori', { duration: 3000 });
      return;
    }

    const userProfile: Profile = {
      userId: '2',
      name: this.userProfileForm.value.name || "",
      surname: this.userProfileForm.value.surname || "",
      imageURL: this.userProfileForm.value.imageURL || "",
      biography: this.userProfileForm.value.biography || "",
      moto: this.userProfileForm.value.moto || ""
    };

    if (this.selectedFile) {
      this.imageService.setControllerPath("/image");
      this.imageService.uploadImage(this.selectedFile).subscribe((imageId: number) => {
        this.imageService.getImage(imageId);
        userProfile.imageURL = imageId.toString();

      });
    }

     this.profileService.createProfile(userProfile).subscribe({
        next: () => alert('Profil sačuvan!'),
        error: (err) => console.error('Greška pri čuvanju profila:', err)
      });
  }

  changeImage(): void {
    this.showImageUpload = true;
    setTimeout(() => {
    this.imageComponent.focusFileInput();
  });
  }
}