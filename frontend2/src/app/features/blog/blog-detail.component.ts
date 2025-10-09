import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen">
      <!-- Hero Image -->
      <div class="h-96 bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
        <div class="text-center text-white">
          <h1 class="text-4xl font-bold mb-4">{{ blogPost.title }}</h1>
          <div class="flex items-center justify-center space-x-4 text-sm">
            <span>By {{ blogPost.author }}</span>
            <span>•</span>
            <span>{{ blogPost.date }}</span>
            <span>•</span>
            <span>{{ blogPost.readTime }}</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto p-6">
        <div class="prose prose-lg max-w-none">
          <p class="text-lg text-muted-foreground mb-6">{{ blogPost.excerpt }}</p>
          
          <div class="text-foreground leading-relaxed space-y-4">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            
            <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">The Journey Begins</h2>
            
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            
            <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">Key Highlights</h2>
            
            <ul class="list-disc list-inside space-y-2 text-foreground">
              <li>Amazing local cuisine and hidden restaurants</li>
              <li>Breathtaking natural landscapes and photography spots</li>
              <li>Cultural experiences and local traditions</li>
              <li>Budget-friendly accommodation recommendations</li>
              <li>Transportation tips and local insights</li>
            </ul>
            
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos 
              qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-12 flex items-center justify-between border-t border-border pt-6">
          <a routerLink="/blog" class="text-primary hover:text-primary/80 font-medium">
            ← Back to Blog
          </a>
          
          <div class="flex space-x-4">
            <button class="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
              Share
            </button>
            <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Like
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BlogDetailComponent {
  blogPost = {
    id: 1,
    title: "Exploring the Hidden Gems of Japan",
    excerpt: "Discover the lesser-known destinations that make Japan truly magical. From ancient temples to modern art installations, this journey will take you off the beaten path.",
    author: "Sarah Chen",
    date: "March 15, 2024",
    readTime: "5 min read"
  };

  constructor(private route: ActivatedRoute) {
    // TODO: Load actual blog post based on route params
  }
}