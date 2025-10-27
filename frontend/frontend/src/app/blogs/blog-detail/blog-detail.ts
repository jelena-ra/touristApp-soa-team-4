import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { Blog } from '../models/Blog';
import { BlogService } from '../services/blog.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommentPayload } from '../services/blog.service';
import { Comment } from '../models/Comment';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, MarkdownModule, ReactiveFormsModule], 
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.css']
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  currentUserId: string | null = null;
  isLiking = false; 
  commentForm!: FormGroup;
  readonly imageBaseUrl = 'http://localhost:8086/images/';

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

   ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.route.paramMap.pipe(
      switchMap(params => {
        const blogId = params.get('id');
        if (blogId) {
          return this.blogService.getBlogById(blogId);
        }
        return of(null);
      })
    ).subscribe(blogPost => {
      this.blog = blogPost;
      console.log("Blog objekat primljen sa API-ja:", this.blog); 
    });
  }

  get hasLiked(): boolean {
    if (!this.blog || !this.currentUserId || !this.blog.likes) {
      return false;
    }
    // Proveravamo da li ID trenutnog korisnika postoji u nizu lajkova
    return this.blog.likes.includes(this.currentUserId);
  }

  toggleLike(): void {
    // DODAJTE OVAJ LOG: Da potvrdimo da se funkcija uopšte poziva
    console.log('toggleLike() pozvan.');

    if (this.isLiking || !this.blog || !this.currentUserId) {
      // DODAJTE OVE LOGOVE: Da vidimo zašto se funkcija prekida
      console.log('Prekidam izvršavanje. Provera uslova:');
      console.log('  - isLiking:', this.isLiking);
      console.log('  - da li blog postoji:', !!this.blog); // !! pretvara objekat u boolean
      console.log('  - currentUserId:', this.currentUserId);
      return; 
    }

    // ... ostatak funkcije ostaje isti
    this.isLiking = true;
    const blogId = this.blog.id!;
    const userId = this.currentUserId;

    console.log(`Akcija: ${this.hasLiked ? 'UNLIKE' : 'LIKE'}`); // Koristan log

    const action = this.hasLiked 
      ? this.blogService.unlikeBlog(blogId, userId)
      : this.blogService.likeBlog(blogId, userId);

    action.subscribe({
      next: (updatedBlog) => {
        this.blog = updatedBlog; 
        this.isLiking = false;
        console.log("Blog uspešno ažuriran:", updatedBlog);
      },
      error: (err) => {
        console.error("Greška prilikom lajkovanja/anlajkovanja:", err);
        this.isLiking = false;
      }
    });
  }

  onCommentSubmit(): void {
    if (this.commentForm.invalid || !this.currentUserId || !this.blog?.id) {
      return; // Izlaz ako forma nije validna ili nedostaju podaci
    }

    const payload: CommentPayload = {
      commentInput: {
        blogId: this.blog.id,
        userId: this.currentUserId,
        content: this.commentForm.value.content
      }
    };

    this.blogService.createComment(payload).subscribe({
      next: (newComment) => {
        // Ažuriramo lokalni niz komentara za instant prikaz
        if (!this.blog!.comments) {
          this.blog!.comments = [];
        }
        this.blog!.comments.push(newComment);
        
        // Resetujemo formu
        this.commentForm.reset();
      },
      error: (err) => {
        console.error("Greška prilikom kreiranja komentara:", err);
        alert("Došlo je do greške. Pokušajte ponovo.");
      }
    });
  }
}