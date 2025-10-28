// U src/app/tours/recension-form/recension-form.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TourService, RecensionPayload } from '../services/tour.service';
import { AuthService } from '../../auth/auth.service';

interface ImagePreview {
  file: File;
  url: string; // Za prikaz u <img>
  base64: string; // Za slanje na server
}

@Component({
  selector: 'app-recension-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recension-form.html',
  styleUrls: ['./recension-form.css']
})
export class RecensionFormComponent implements OnInit {
  // Input: Komponenta prima ID ture od roditeljske komponente
  @Input() tourId!: string;
  // Output: Komponenta javlja roditelju da se zatvori (sa statusom uspeha)
  @Output() close = new EventEmitter<boolean>();

  recensionForm!: FormGroup;
  imagePreviews: ImagePreview[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.recensionForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.required],
      visitDate: ['', Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (file) {
        // Kreiramo URL za preview
        const previewUrl = URL.createObjectURL(file);
        // Čitamo fajl kao Base64 za slanje
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push({
            file: file,
            url: previewUrl,
            base64: (reader.result as string).split(',')[1] // Uzimamo samo Base64 deo, bez prefiksa
          });
        };
        reader.readAsDataURL(file);
      }
    }
    input.value = '';
  }

  removePreview(index: number): void {
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.recensionForm.invalid) {
      this.recensionForm.markAllAsTouched();
      return;
    }
    
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      alert("Morate biti ulogovani da biste ostavili recenziju.");
      return;
    }

    this.isSubmitting = true;
    const formValue = this.recensionForm.value;

    const localDate = new Date(formValue.visitDate);
    const visitDateISO = localDate.toISOString();

    const payload: RecensionPayload = {
      recension: {
        authorId: currentUserId,
        tourId: this.tourId,
        rating: Number(formValue.rating),
        visitDate: visitDateISO,
        comment: formValue.comment,
        createdAt: new Date().toISOString(),
        pictures: []
      },
      picturesBase64: this.imagePreviews.map(p => p.base64)
    };

    console.log("Šaljem sledeći payload na server:", JSON.stringify(payload, null, 2));

    this.tourService.createRecension(payload).subscribe({
      next: () => {
        alert("Hvala na recenziji!");
        this.isSubmitting = false;
        this.close.emit(true); // Javljamo da je uspelo
      },
      error: (err) => {
        console.error("Greška pri kreiranju recenzije:", err);
        alert("Došlo je do greške. Pokušajte ponovo.");
        this.isSubmitting = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit(false); // Javljamo da je korisnik samo zatvorio modal
  }
}