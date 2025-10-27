import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common'; // Potreban za ngIf
import { HttpClientModule } from '@angular/common/http';
import { ImageComponent } from '../image/image';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/model/user.model';
import { ActivatedRoute } from '@angular/router';

export interface Profile {
  userId: string;
  name: string;
  surname: string;
  photoId: string;
  biography: string;
  moto: string;
  money: number;
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
    private profileService : ProfileService,
     private auth: AuthService,
     private route: ActivatedRoute,
  ) { }
 
flag:boolean=false;
 private userId: string = "";
  userr: User | null = null;
  @Input() profile: Profile = {
    userId: '',
    name: '',
    surname: '',
    photoId: '',
    biography: '',
    moto: '',
    money: 0,
  };
 
  @Output() profileUpdated = new EventEmitter<string>();
  selectedFile: File | null = null;
  showImageUpload: boolean = false;
  @ViewChild('imageUploadInput') imageUploadInput!: ElementRef;

imagePreviewUrl: string | ArrayBuffer | null = null;
  user = { role: 'user' };
  moneyy:number=0;
  userProfileForm = new FormGroup({
    userId:  new FormControl(''), 
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    photoId: new FormControl(''),
    biography: new FormControl(''),
    moto: new FormControl(''),
    money:new FormControl(0)
  });

  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          const flagParam = params.get('flag');
          this.flag = (flagParam === 'true'); 
          console.log('Flag iz rute (path parameter):', this.flag);
      });
     this.auth.getUser().subscribe((user: User) => {
                this.userId = user.id;
                this.userr = user;
                console.log('Trenutni korisnik Id:', this.userId);
                console.log('Trenutni korisnik:', this.userr);
            });
    
    if (this.flag) {
          this.profileService.getProfileByUserId(this.userId).subscribe({
              next: (profile: Profile) => {
                this.populateForm(profile); 
                this.moneyy = profile.money;
                console.log('Profile photoId:', profile.photoId);
                if (profile.photoId) {
                  this.imagePreviewUrl = `http://localhost:8081/image/filename/${profile.photoId}`;
                }
            },
          error: (err) => {
            console.error('Greška pri dohvatanju profila:', err);
            this.snackBar.open('Greška pri učitavanju profila.', 'Zatvori', { duration: 3000 });
            this.flag = false;
            }
        });
      } else {
        this.userProfileForm.patchValue({
          userId: this.userId
        });
      }
   
  }


  populateForm(profile: Profile): void {
    this.userProfileForm.patchValue({
      userId: profile.userId,
      name: profile.name,
      surname: profile.surname,
      photoId: profile.photoId,
      biography: profile.biography,
      moto: profile.moto
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

/*
  updateProfile(): void {
    if (this.userProfileForm.invalid) {
      this.snackBar.open('Molimo popunite sva obavezna polja.', 'Zatvori', { duration: 3000 });
      return;
    }

    const userProfile: Profile = {
      userId: this.userId || "",
      name: this.userProfileForm.value.name || "",
      surname: this.userProfileForm.value.surname || "",
      imageURL: this.userProfileForm.value.imageURL || "",
      biography: this.userProfileForm.value.biography || "",
      moto: this.userProfileForm.value.moto || "",
      money: this.moneyy
    };

    if (this.selectedFile) {
      this.imageService.setControllerPath("/image");
      this.imageService.uploadImage(this.selectedFile).subscribe((imageId: number) => {
        this.imageService.getImage(imageId);
        userProfile.imageURL = imageId.toString();

      });
    }
    if(!this.flag){
     this.profileService.createProfile(userProfile).subscribe({
        next: () => alert('Profil sačuvan!'),
        error: (err) => console.error('Greška pri čuvanju profila:', err)
      });
    }else{
    this.profileService.updateProfile(userProfile).subscribe({
        next: () => alert('Profil sačuvan!'),
        error: (err) => console.error('Greška pri čuvanju profila:', err)
      });
    }
  }
*/


  updateProfile(): void {
    if (this.userProfileForm.invalid) {
      this.snackBar.open('Molimo popunite sva obavezna polja.', 'Zatvori', { duration: 3000 });
      return;
    }

    const userProfile: Profile = {
      userId: this.userId || "",
      name: this.userProfileForm.value.name || "",
      surname: this.userProfileForm.value.surname || "",
      // BITNO: Inicijaliziramo imageURL s postojećom vrijednošću iz forme.
      // Ako korisnik UPLOAD-a novu sliku, ova će se vrijednost PREGAZITI
      // unutar subscribe bloka imageService-a.
      photoId: this.userProfileForm.value.photoId || "", 
      biography: this.userProfileForm.value.biography || "",
      moto: this.userProfileForm.value.moto || "",
      money: this.moneyy
    };

    // Pomoćna funkcija za spremanje profila, koristit ćemo je na dva mjesta
    const saveProfile = (profileToSave: Profile) => {
      if (!this.flag) {
        this.profileService.createProfile(profileToSave).subscribe({
          next: () => {
            this.snackBar.open('Profil sačuvan!', 'Zatvori', { duration: 3000 });
            this.profileUpdated.emit(profileToSave.userId); // Emituj event ako je potrebno
          },
          error: (err) => console.error('Greška pri čuvanju profila:', err)
        });
      } else {
        this.profileService.updateProfile(profileToSave).subscribe({
          next: () => {
            this.snackBar.open('Profil ažuriran!', 'Zatvori', { duration: 3000 });
            this.profileUpdated.emit(profileToSave.userId); // Emituj event ako je potrebno
          },
          error: (err) => console.error('Greška pri ažuriranju profila:', err)
        });
      }
    };

    // Logika za upload slike
    if (this.selectedFile) {
      this.imageService.setControllerPath("/image");
      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (imageId: number) => {
          this.imageService.getImage(imageId);
          userProfile.photoId = imageId.toString(); // <--- OVDJE se photoId postavlja na ID uploaded slike
          saveProfile(userProfile); // <--- TEK NAKON što je slika uploaded, spremi profil
        },
        error: (err) => {
          console.error('Greška pri uploadu slike:', err);
          this.snackBar.open('Greška pri uploadu slike. Pokušajte ponovo.', 'Zatvori', { duration: 3000 });
          // Ovdje možete odlučiti želite li ipak spremiti profil bez slike ili prekinuti operaciju.
          // Za sada, ne zovemo saveProfile ako upload ne uspije.
        }
      });
    } else {
      // Ako nema nove slike za upload, jednostavno spremi profil s trenutnim imageURL-om
      saveProfile(userProfile);
    }
  }

  changeImage(): void {
    this.showImageUpload = true;
    setTimeout(() => {
    this.imageComponent.focusFileInput();
  });
  }
}