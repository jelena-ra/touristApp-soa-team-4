import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

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
  selector: 'app-blog-feed',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
        <div class="max-w-7xl mx-auto px-6 py-12">
          
          <!-- Header Section -->
          <div class="text-center mb-16">
            <h1 class="text-5xl md:text-6xl font-thin text-white mb-6 tracking-wide animate-glow">
              Putničke Priče
            </h1>
            <div class="cosmic-line mx-auto mb-8"></div>
            <p class="text-xl text-gray-300 font-light max-w-2xl mx-auto">
              Otkrijte neverovatne priče od putnika širom sveta i podelite svoje avanture
            </p>
          </div>

          <!-- Filter and Create Section -->
          <div class="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-6 lg:space-y-0">
            <div class="flex flex-wrap gap-4">
              <button class="glass-button glass-button-primary px-6 py-3 text-sm font-light tracking-wide">
                <span class="flex items-center space-x-2">
                  <span>📖</span>
                  <span>Sve Priče</span>
                </span>
              </button>
              <button class="glass-button glass-button-secondary px-6 py-3 text-sm font-light tracking-wide">
                <span class="flex items-center space-x-2">
                  <span>🏔️</span>
                  <span>Avantura</span>
                </span>
              </button>
              <button class="glass-button glass-button-secondary px-6 py-3 text-sm font-light tracking-wide">
                <span class="flex items-center space-x-2">
                  <span>🏛️</span>
                  <span>Kultura</span>
                </span>
              </button>
              <button class="glass-button glass-button-secondary px-6 py-3 text-sm font-light tracking-wide">
                <span class="flex items-center space-x-2">
                  <span>🍽️</span>
                  <span>Hrana</span>
                </span>
              </button>
            </div>
            <a routerLink="/blog/create" 
               class="glass-button glass-button-primary px-8 py-4 text-lg font-light tracking-wide group">
              <span class="flex items-center space-x-3">
                <span class="text-2xl group-hover:scale-110 transition-transform">✍️</span>
                <span>Napišite Priču</span>
              </span>
            </a>
          </div>

          <!-- Blog Posts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let post of blogPosts; let i = index" 
                 [@fadeInUp]
                 class="glass-panel rounded-3xl overflow-hidden group hover:transform hover:scale-105 transition-all duration-300"
                 [style.animation-delay]="i * 100 + 'ms'">
              
              <!-- Post Image -->
              <div class="relative h-48 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-green-400/30"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-6xl opacity-60">{{ post.image }}</span>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="glass-badge px-3 py-1 text-xs font-light text-white/80">
                    {{ post.category }}
                  </span>
                </div>
              </div>
              
              <!-- Post Content -->
              <div class="p-8">
                <h3 class="text-xl font-light text-white mb-4 line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {{ post.title }}
                </h3>
                <p class="text-gray-400 text-sm font-light mb-6 line-clamp-3 leading-relaxed">
                  {{ post.excerpt }}
                </p>
                
                <!-- Post Meta -->
                <div class="flex items-center justify-between text-xs text-gray-500 mb-6">
                  <span class="flex items-center space-x-2">
                    <span>👤</span>
                    <span>{{ post.author }}</span>
                  </span>
                  <span class="flex items-center space-x-2">
                    <span>⏱️</span>
                    <span>{{ post.readTime }}</span>
                  </span>
                </div>
                
                <!-- Read More Button -->
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">{{ post.date }}</span>
                  <a [routerLink]="['/blog', post.id]" 
                     class="glass-button-small px-4 py-2 text-sm font-light text-blue-400 hover:text-green-400 transition-colors">
                    Pročitajte Više →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Section -->
          <div class="text-center mt-16">
            <button class="glass-button glass-button-secondary px-12 py-4 text-lg font-light tracking-wide">
              <span class="flex items-center space-x-3">
                <span class="text-2xl">📚</span>
                <span>Učitajte Više Priča</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .particle-container {
      pointer-events: none;
    }
    
    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      opacity: 0.8;
    }
    
    .particle.type-1 {
      background: radial-gradient(circle, rgba(96, 165, 250, 0.9) 0%, transparent 70%);
      animation: float1 8s infinite ease-in-out;
    }
    
    .particle.type-2 {
      background: radial-gradient(circle, rgba(52, 211, 153, 0.8) 0%, transparent 70%);
      animation: float2 12s infinite ease-in-out;
    }
    
    .particle.type-3 {
      background: radial-gradient(circle, rgba(167, 139, 250, 0.7) 0%, transparent 70%);
      animation: float3 10s infinite ease-in-out;
    }
    
    @keyframes float1 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
      25% { transform: translate(100px, -50px) scale(1.2); opacity: 1; }
      50% { transform: translate(-50px, -100px) scale(0.8); opacity: 0.7; }
      75% { transform: translate(-80px, 50px) scale(1.1); opacity: 0.9; }
    }
    
    @keyframes float2 {
      0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
      33% { transform: translate(-120px, -80px) rotate(120deg); opacity: 1; }
      66% { transform: translate(80px, -60px) rotate(240deg); opacity: 0.6; }
    }
    
    @keyframes float3 {
      0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; }
      50% { transform: translate(60px, -120px) scale(1.5) rotate(180deg); opacity: 1; }
    }
    
    .glass-panel {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      box-shadow: 
        0 0 40px rgba(96, 165, 250, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .glass-button {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 50px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .glass-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
      border-color: rgba(96, 165, 250, 0.4);
    }
    
    .glass-button-primary {
      color: white;
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    }
    
    .glass-button-secondary {
      color: rgba(255, 255, 255, 0.8);
      border-color: rgba(148, 163, 184, 0.3);
    }
    
    .glass-button-small {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 20px;
      transition: all 0.3s ease;
    }
    
    .glass-badge {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 15px;
    }
    
    .cosmic-line {
      width: 300px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), rgba(52, 211, 153, 0.5), transparent);
      margin: 0 auto;
      animation: lineGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes lineGlow {
      from { box-shadow: 0 0 5px rgba(96, 165, 250, 0.3); }
      to { box-shadow: 0 0 15px rgba(52, 211, 153, 0.6); }
    }
    
    .animate-glow {
      animation: textGlow 4s ease-in-out infinite alternate;
    }
    
    @keyframes textGlow {
      from { 
        text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
        filter: brightness(1);
      }
      to { 
        text-shadow: 0 0 40px rgba(52, 211, 153, 0.8);
        filter: brightness(1.2);
      }
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BlogFeedComponent implements OnInit {
  particles: Particle[] = [];
  mouseX: number = 0;
  mouseY: number = 0;

  blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Skrivene Ljepote Crne Gore',
      excerpt: 'Otkrijte najlepše planine, jezera i tradicionalna sela koja mnogi turisti nikad ne vide. Putovanje kroz netaknutu prirodu Durmitora.',
      author: 'Marko Petrović',
      date: '15. Dec 2024',
      readTime: '5 min',
      category: 'Avantura',
      image: '🏔️'
    },
    {
      id: 2,
      title: 'Kulinarska Putovanja kroz Italiju',
      excerpt: 'Od authentične paste u Rimu do najboljih gelata u Firenci. Vodič kroz regionalne specijalitete koji će vas ostaviti bez daha.',
      author: 'Ana Jovanović',
      date: '12. Dec 2024',
      readTime: '8 min',
      category: 'Hrana',
      image: '🍝'
    },
    {
      id: 3,
      title: 'Temples i Tradicija u Kyotu',
      excerpt: 'Uronjenje u bogatu kulturu Japana kroz posete hramovima, tradicionalne ceremonije čaja i susreti sa lokalnim meštrovima.',
      author: 'Stefan Nikolić',
      date: '10. Dec 2024',
      readTime: '6 min',
      category: 'Kultura',
      image: '⛩️'
    },
    {
      id: 4,
      title: 'Island Hopping u Grčkoj',
      excerpt: 'Santorini, Mykonos, Crete - vodič kroz najlepše grčke ostrvove sa savetima za budžet putovanja i najbolje plaže.',
      author: 'Milica Stojanović',
      date: '8. Dec 2024',
      readTime: '7 min',
      category: 'Avantura',
      image: '🏝️'
    },
    {
      id: 5,
      title: 'Noću kroz Amsterdam',
      excerpt: 'Kanali, muzeji, kafići i noćni život. Otkrijte kako da iskoristite svaki trenutak u ovom fantastičnom gradu.',
      author: 'Nikola Miličić',
      date: '5. Dec 2024',
      readTime: '4 min',
      category: 'Kultura',
      image: '🏛️'
    },
    {
      id: 6,
      title: 'Safari Avantura u Keniji',
      excerpt: 'Susret sa velikom petorkom životinja u njihovom prirodnom staništu. Nezaboravno iskustvo u Masai Mara rezervatu.',
      author: 'Jovana Radić',
      date: '3. Dec 2024',
      readTime: '9 min',
      category: 'Avantura',
      image: '🦁'
    }
  ];

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
  }

  generateParticles() {
    const particleCount = 80;
    this.particles = [];
    
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * screenWidth;
      const y = Math.random() * screenHeight;
      this.particles.push({
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        delay: Math.random() * 10,
        type: `type-${Math.floor(Math.random() * 3) + 1}`,
        vx: 0,
        vy: 0
      });
    }
  }

  setupMouseListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.updateParticleTargets();
      });
    }
  }

  updateParticleTargets() {
    this.particles.forEach(particle => {
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 120) {
        const force = (120 - distance) / 120;
        particle.targetX = particle.x - (dx / distance) * force * 40;
        particle.targetY = particle.y - (dy / distance) * force * 40;
      } else {
        particle.targetX = particle.x;
        particle.targetY = particle.y;
      }
    });
  }

  animateParticles() {
    if (typeof window !== 'undefined') {
      const animate = () => {
        this.particles.forEach(particle => {
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;
          
          particle.vx += dx * 0.01;
          particle.vy += dy * 0.01;
          
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          
          particle.x += particle.vx;
          particle.y += particle.vy;
        });
        
        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  trackParticle(index: number, particle: Particle): number {
    return index;
  }
}