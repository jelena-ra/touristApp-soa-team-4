import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { BlogService, BlogPayload} from '../services/blog.service';
import { ImageService, ImageUploadResponse } from '../services/image';
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
    ReactiveFormsModule
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
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const previewUrl = URL.createObjectURL(file);
      this.imagePreviews.push({ file: file, url: previewUrl });
    }
  }

  removePreview(index: number): void {
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      return;
    }

    this.isUploading = true;

    const uploadObservables: Observable<ImageUploadResponse>[] = this.imagePreviews
      .map(preview => this.imageService.uploadImage(preview.file));

    if (uploadObservables.length === 0) {
      this.createBlog([]); 
      return;
    }

    forkJoin(uploadObservables).subscribe({
      next: (responses) => {
        const imageUrls = responses.map(res => res.url);
        this.createBlog(imageUrls);
      },
      error: (err) => {
        console.error("Greška prilikom uploada slika:", err);
        alert("Došlo je do greške prilikom uploada slika.");
        this.isUploading = false;
      }
    });
  }
  
  private createBlog(imageUrls: string[]): void {
    const formValue = this.blogForm.value;
    
    const currentUserId = this.authService.getCurrentUserId();

    if (!currentUserId) {
      alert("Greška: Korisnik nije ulogovan.");
      this.isUploading = false;
      return;
    }

    const payload: BlogPayload = {
      blogInput: {
        title: formValue.title,
        content: formValue.content,
        authorId: currentUserId,
        images: imageUrls
      }
    };
    
    this.blogService.createBlog(payload).subscribe({
      next: (createdBlog) => {
        console.log('Blog je uspešno kreiran!', createdBlog);
        alert('Blog je uspešno kreiran!');
        this.blogForm.reset();
        this.imagePreviews = []; 
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Došlo je do greške:', err);
        alert('Došlo je do greške prilikom kreiranja bloga.');
        this.isUploading = false;
      }
    });
  }
}
