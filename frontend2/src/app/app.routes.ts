import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'login', redirectTo: 'auth/login' },
  { path: 'register', redirectTo: 'auth/register' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'profile/:id', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'blog', loadComponent: () => import('./features/blog/blog-feed.component').then(m => m.BlogFeedComponent) },
  { path: 'blog/create', loadComponent: () => import('./features/blog/blog-create.component').then(m => m.BlogCreateComponent) },
  { path: 'blog/:id', loadComponent: () => import('./features/blog/blog-detail.component').then(m => m.BlogDetailComponent) },
  { path: 'tours', loadComponent: () => import('./features/tours/tour-feed.component').then(m => m.TourFeedComponent) },
  { path: 'tours/create', loadComponent: () => import('./features/tours/tour-create.component').then(m => m.TourCreateComponent) },
  { path: 'tours/:id', loadComponent: () => import('./features/tours/tour-detail.component').then(m => m.TourDetailComponent) },
  { path: 'followers', loadComponent: () => import('./features/followers/followers.component').then(m => m.FollowersComponent) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
