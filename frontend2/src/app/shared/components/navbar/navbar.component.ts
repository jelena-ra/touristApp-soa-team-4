import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <nav class="nav-minimal sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
              <span class="text-background text-sm">🗺️</span>
            </div>
            <span class="font-light text-lg tracking-wide">TravelPlatform</span>
          </a>

          <!-- Navigation Links (always visible if logged in) -->
          <div class="flex space-x-1" *ngIf="isLoggedIn">
            <ng-container *ngFor="let item of navigation">
              <a
                [routerLink]="item.href"
                routerLinkActive="bg-foreground text-background"
                class="flex items-center space-x-2 font-light tracking-wide transition-all duration-300 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <span [innerHTML]="item.icon"></span>
                <span>{{ item.name }}</span>
              </a>
            </ng-container>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <ng-container *ngIf="isLoggedIn; else authButtons">
              <!-- Shopping Cart -->
              <a routerLink="/cart" class="relative text-muted-foreground hover:text-foreground">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span class="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">0</span>
              </a>

              <!-- User Dropdown -->
              <div class="relative">
                <button type="button" (click)="toggleUserMenu()" class="relative h-8 w-8 rounded-full flex items-center justify-center focus:outline-none" tabindex="0">
                  <img *ngIf="currentUser.profileImage" [src]="currentUser.profileImage" [alt]="currentUser.name" class="h-8 w-8 rounded-full object-cover pointer-events-none" />
                  <span *ngIf="!currentUser.profileImage" class="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium pointer-events-none">{{ getUserInitials() }}</span>
                </button>
                <div *ngIf="showUserMenu" class="absolute right-0 mt-2 w-56 minimal-card bg-card border border-border rounded-md shadow-lg z-50">
                  <div class="flex items-center justify-start gap-2 p-2">
                    <div class="flex flex-col space-y-1 leading-none">
                      <p class="font-medium">{{ currentUser.name }}</p>
                      <p class="w-[200px] truncate text-sm text-muted-foreground">{{ currentUser.email }}</p>
                      <p class="text-xs text-muted-foreground capitalize">{{ currentUser.role }}</p>
                    </div>
                  </div>
                  <div class="border-t border-border"></div>
                  <a (click)="goToProfile()" class="block px-4 py-2 text-sm flex items-center hover:bg-accent transition-colors cursor-pointer">
                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
                    <span>Profil</span>
                  </a>
                  <a *ngIf="currentUser.role === 'admin'" routerLink="/admin" class="block px-4 py-2 text-sm flex items-center hover:bg-accent transition-colors">
                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1V13a2 2 0 0 1 0-4v-.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 7 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.36.57.86.57 1.38V11a2 2 0 0 1 0 4v.09c0 .52-.21 1.02-.57 1.38z"/></svg>
                    <span>Admin Panel</span>
                  </a>
                  <div class="border-t border-border"></div>
                  <button (click)="logout()" class="block px-4 py-2 text-sm flex items-center text-destructive hover:bg-accent transition-colors w-full text-left">
                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Izloguj se</span>
                  </button>
                </div>
              </div>
            </ng-container>
            <ng-template #authButtons>
              <div class="flex items-center space-x-2">
                <a routerLink="/login" class="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </a>
                <a routerLink="/register" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Register
                </a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-item {
      @apply px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
      @apply text-muted-foreground hover:text-foreground hover:bg-accent;
      @apply flex items-center space-x-2;
    }

    .nav-item.active-nav-item {
      @apply bg-primary text-primary-foreground;
    }

    .dropdown-item {
      @apply block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors;
    }
  `]
})
export class NavbarComponent {
  showUserMenu = false;
  isLoggedIn = false; // TODO: Connect to auth service
  
  currentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'vodič',
    profileImage: '' // set to image url if available
  };

  goToProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/profile', this.currentUser.id]);
  }

  navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Tours', href: '/tours', icon: '🧭' },
    { name: 'Blog', href: '/blog', icon: '📖' },
    { name: 'Followers', href: '/followers', icon: '👥' },
  ];

  constructor(private router: Router) {
    // TODO: Subscribe to auth state
    this.isLoggedIn = true; // Temporary for testing
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  getUserInitials(): string {
    return this.currentUser.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  }

  logout() {
    this.showUserMenu = false;
    this.isLoggedIn = false;
    // TODO: Implement actual logout logic
    this.router.navigate(['/']);
  }

  navigate(href: string) {
    this.router.navigate([href]);
    return false;
  }
}