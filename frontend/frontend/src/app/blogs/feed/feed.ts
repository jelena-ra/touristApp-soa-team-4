import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs'; 
import { Blog } from '../../blogs/models/Blog';
import { BlogService } from '../../blogs/services/blog.service';
import { AuthService } from '../../auth/auth.service';
import { FollowingService } from '../../following/following';
import { BlogCardComponent } from '../blog-card/blog-card';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, BlogCardComponent],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css']
})
export class FeedComponent implements OnInit {
  allBlogs: Blog[] = [];
  followingAuthorIds: Set<string> = new Set();
  isLoading = true;
  currentUserId: string | null = null;

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private followingService: FollowingService // Injektujte FollowingService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    
    // Slučaj 1: Korisnik nije ulogovan
    if (!this.currentUserId) {
      this.blogService.getAllBlogs().subscribe(blogs => {
        this.allBlogs = blogs;
        this.isLoading = false;
      });
      return;
    }
    
    // Slučaj 2: Korisnik je ulogovan, dobavljamo sve podatke
    forkJoin({
      blogs: this.blogService.getAllBlogs(),
      followingResponse: this.followingService.getFollowings(this.currentUserId)
    }).subscribe(({ blogs, followingResponse }) => {
      this.allBlogs = blogs;
      // Kreiramo Set ID-jeva autora koje pratimo
      this.followingAuthorIds = new Set(followingResponse.ids);
      this.isLoading = false;
    });
  }
}