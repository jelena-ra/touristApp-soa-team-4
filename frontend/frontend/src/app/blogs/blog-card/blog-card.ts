import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Blog } from '../models/Blog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-card.html',
  styleUrls: ['./blog-card.css']
})
export class BlogCardComponent {
  @Input() blog!: Blog;
  // NOVI INPUT: Govori kartici da li je dozvoljeno otići na detalje
  @Input() isClickable: boolean = false;

  constructor(private router: Router) {}

  navigateToDetails(): void {
    // Navigacija se izvršava SAMO ako je kartica klikabilna
    if (this.isClickable && this.blog?.id) {
      this.router.navigate(['/blogs', this.blog.id]);
    }
  }
}