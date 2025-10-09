import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { BlogService } from '../../core/services/blog.service';
import { AuthService } from '../../core/services/auth.service';
import { BlogForm } from '../../core/models';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  delay: number;
  type: string;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="relative min-h-screen bg-black overflow-hidden">
      <!-- Animated Particle Background -->
      <div class="absolute inset-0 particle-container">
        <div class="particle" *ngFor="let particle of particles; trackBy: trackParticle" 
             [style.left.px]="particle.x" 
             [style.top.px]="particle.y"
             [style.animation-delay]="particle.delay + 's'"
             [ngClass]="particle.type"></div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen">
        <div class="max-w-4xl mx-auto px-6 py-12">
          
          <!-- Header Section -->
          <div class="text-center mb-12">
            <button (click)="goBack()" 
                    class="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-8">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Nazad na blog
            </button>
            
            <h1 class="text-4xl md:text-5xl font-thin text-white mb-4 tracking-wide animate-glow">
              Kreiraj Priču
            </h1>
            <p class="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Podeli svoja putovanja i inspirišu druge avanturiste
            </p>
          </div>

          <!-- Create Form Card -->
          <div class="glass-card p-8 rounded-2xl border border-white/20 backdrop-blur-xl">
            <form (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Title Input -->
              <div class="space-y-2">
                <label for="title" class="block text-sm font-medium text-gray-300">
                  Naslov priče
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  [(ngModel)]="blogForm.title"
                  required
                  placeholder="Unesi naslov svoje priče..."
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Content Textarea -->
              <div class="space-y-2">
                <label for="content" class="block text-sm font-medium text-gray-300">
                  Sadržaj priče
                </label>
                <textarea
                  id="content"
                  name="content"
                  [(ngModel)]="blogForm.content"
                  required
                  rows="12"
                  placeholder="Ispričaj svoju priču..."
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                ></textarea>
              </div>

              <!-- Image Upload -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">
                  Slika (opcionalno)
                </label>
                <div class="flex items-center justify-center w-full">
                  <label for="image-upload" 
                         class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6" *ngIf="!imagePreview">
                      <svg class="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-400">
                        <span class="font-semibold">Klikni da učitaš</span> ili prevuci ovde
                      </p>
                      <p class="text-xs text-gray-500">PNG, JPG do 10MB</p>
                    </div>
                    
                    <div class="relative w-full h-full" *ngIf="imagePreview">
                      <img [src]="imagePreview" alt="Preview" class="w-full h-full object-cover rounded-lg">
                      <button type="button" 
                              (click)="removeImage($event)"
                              class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    
                    <input id="image-upload" type="file" class="hidden" accept="image/*" (change)="onImageSelect($event)">
                  </label>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  [disabled]="!blogForm.title || !blogForm.content || loading"
                  class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                >
                  <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg *ngIf="!loading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  {{ loading ? 'Objavljivanje...' : 'Objavi Priču' }}
                </button>
                
                <button
                  type="button"
                  (click)="goBack()"
                  class="px-6 py-3 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium flex items-center justify-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Otkaži
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .animate-glow {
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from {
        text-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
      }
      to {
        text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.5);
      }
    }

    .particle-container {
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: #3B82F6;
      border-radius: 50%;
      opacity: 0.8;
      animation: float 6s infinite linear;
    }

    .particle.star {
      background: #F59E0B;
      box-shadow: 0 0 8px #F59E0B;
    }

    .particle.blue {
      background: #3B82F6;
      box-shadow: 0 0 6px #3B82F6;
    }

    .particle.purple {
      background: #8B5CF6;
      box-shadow: 0 0 6px #8B5CF6;
    }

    @keyframes float {
      0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.8;
      }
      90% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(-10px) rotate(360deg);
        opacity: 0;
      }
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.6);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(59, 130, 246, 0.8);
    }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BlogCreateComponent {
  particles: Particle[] = [];
  loading = false;
  imagePreview: string | null = null;
  
  blogForm: BlogForm = {
    title: '',
    content: '',
    image: undefined
  };

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.generateParticles();
  }

  generateParticles(): void {
    this.particles = [];
    
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const types = ['star', 'blue', 'purple'];
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
        delay: Math.random() * 5,
        type: types[Math.floor(Math.random() * types.length)],
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }
  }

  trackParticle(index: number): number {
    return index;
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Fajl je prevelik. Maksimalna veličina je 10MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Molimo odaberite sliku (PNG, JPG, JPEG).');
        return;
      }

      this.blogForm.image = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.blogForm.image = undefined;
    this.imagePreview = null;
    
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (!this.blogForm.title.trim() || !this.blogForm.content.trim()) {
      alert('Molimo unesite naslov i sadržaj priče.');
      return;
    }

    this.loading = true;

    this.blogService.createBlog(this.blogForm).subscribe({
      next: (response) => {
        console.log('Blog created successfully:', response);
        alert('Priča je uspešno objavljena!');
        this.router.navigate(['/blog']);
      },
      error: (error) => {
        console.error('Error creating blog:', error);
        alert('Došlo je do greške prilikom objavljivanja priče. Pokušajte ponovo.');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }
}