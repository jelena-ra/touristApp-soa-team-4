import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs'; 
import { Blog } from '../../blogs/models/Blog';
import { BlogService } from '../../blogs/services/blog.service';
import { AuthService } from '../../auth/auth.service';
// FollowingService nam više ne treba ovde
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
  followedBlogIds: Set<string> = new Set();
  isLoading = true;
  currentUserId: string | null = null;

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    
    if (!this.currentUserId) {
      this.blogService.getAllBlogs().subscribe(blogs => {
        this.allBlogs = blogs;
        this.isLoading = false;
      });
      return;
    }
    
    forkJoin({
      allBlogs: this.blogService.getAllBlogs(),
      feedBlogs: this.blogService.getFeedForUser(this.currentUserId)
    }).subscribe(({ allBlogs, feedBlogs }) => {
      this.allBlogs = allBlogs;
      
      if (feedBlogs && Array.isArray(feedBlogs)) {
        const feedBlogIds = feedBlogs.map(blog => blog.id!);
        this.followedBlogIds = new Set(feedBlogIds);
      } else {
        this.followedBlogIds = new Set();
      }

      console.log("[DEBUG] Svi blogovi:", this.allBlogs);
      console.log("[DEBUG] Blogovi iz feed-a:", feedBlogs); 
      console.log("[DEBUG] ID-jevi klikabilnih blogova:", this.followedBlogIds);
      
      this.isLoading = false;
    });

  }
}