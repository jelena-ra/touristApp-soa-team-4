import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center max-w-md mx-auto px-4">
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-primary/20">404</h1>
        </div>
        
        <h2 class="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
        
        <p class="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div class="space-y-4">
          <a 
            routerLink="/" 
            class="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </a>
          
          <div class="flex justify-center space-x-4 text-sm">
            <a routerLink="/blog" class="text-primary hover:text-primary/80">Browse Blog</a>
            <span class="text-muted-foreground">•</span>
            <a routerLink="/tours" class="text-primary hover:text-primary/80">View Tours</a>
            <span class="text-muted-foreground">•</span>
            <a routerLink="/dashboard" class="text-primary hover:text-primary/80">Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {

}