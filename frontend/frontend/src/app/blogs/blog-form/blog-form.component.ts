import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http'; 
import { AuthService } from '../../auth/auth.service';
import { BlogService, BlogPayload } from '../services/blog.service';
import { ImageService } from '../services/image';
import { Blog } from '../models/Blog';

interface ImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule // Obavezno dodaj HttpClientModule ovde!
  ],
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.css']
})
export class BlogFormComponent implements OnInit {
  blogForm!: FormGroup;
  imagePreviews: ImagePreview[] = [];
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private imageService: ImageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Ispravna ngOnInit metoda - samo inicijalizuje formu
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    // Omogućava dodavanje više slika jednu po jednu
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        this.imagePreviews.push({ file: file, url: previewUrl });
      }
    }
    // Resetuj input polje da bi isti fajl mogao ponovo da se izabere ako se obriše
    input.value = '';
  }

  removePreview(index: number): void {
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      // Opciono: označi polja kao dodirnuta da se prikažu greške
      this.blogForm.markAllAsTouched();
      return;
    }
    
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      alert("Greška: Korisnik nije ulogovan.");
      return;
    }

    this.isUploading = true;
    const formValue = this.blogForm.value;

    const blogPayload: BlogPayload = {
      blogInput: {
        title: formValue.title,
        content: formValue.content,
        authorId: currentUserId,
        images: [] // Uvek kreiramo blog sa praznim nizom slika
      }
    };

    // Glavna logika: kreiraj blog, pa uploaduj slike
    this.blogService.createBlog(blogPayload).pipe(
      switchMap((createdBlog: Blog) => {
        // Provera da li blog i ID postoje pre uploada
        if (!createdBlog?.id) {
          throw new Error('Kreirani blog nema ID.');
        }

        if (this.imagePreviews.length === 0) {
          return of(createdBlog);
        }

        const uploadObservables = this.imagePreviews.map(preview =>
          this.imageService.uploadImage(createdBlog.id!, preview.file)
        );

        return forkJoin(uploadObservables).pipe(
          map(() => createdBlog) // Vraćamo originalni blog nakon što se sve slike uploaduju
        );
      })
    ).subscribe({
      next: (finalBlog) => {
        console.log('Blog i slike su uspešno sačuvani!', finalBlog);
        alert('Blog je uspešno kreiran!');
        this.blogForm.reset();
        this.imagePreviews = [];
        this.isUploading = false;
        // Opciono: preusmeri korisnika na stranicu novog bloga
        // this.router.navigate(['/blogs', finalBlog.id]);
      },
      error: (err) => {
        console.error("Došlo je do greške:", err);
        alert("Došlo je do greške prilikom kreiranja bloga ili uploada slika.");
        this.isUploading = false;
      }
    });
  }
}