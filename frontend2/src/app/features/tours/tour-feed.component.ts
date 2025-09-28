import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

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

interface Tour {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  length: number;
  walkingDuration: string;
  bikingDuration: string;
  price: number;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  rating: number;
  reviewCount: number;
}

@Component({
  selector: 'app-tour-feed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative min-h-screen bg-black overflow-hidden">
      <!-- Cosmic Particle Background -->
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
          
          <!-- Header Constellation -->
          <div class="text-center mb-16">
            <div [@starBurst] class="cosmic-glow mb-8">
              <span class="text-7xl">🗺️</span>
            </div>
            <h1 class="text-5xl md:text-6xl font-thin text-white mb-6 tracking-wide animate-glow">
              Otkrijte Nezaboravne Ture
            </h1>
            <div class="cosmic-line mx-auto mb-8"></div>
            <p class="text-xl text-gray-300 font-light max-w-2xl mx-auto">
              Istražite kurirane putne rute i doživite magiju srpskih krajeva
            </p>
          </div>

          <!-- Filter Controls -->
          <div class="glass-constellation rounded-2xl p-6 mb-12">
            <div class="flex flex-wrap items-center justify-center gap-4">
              <button
                *ngFor="let filter of filters"
                [class.active]="selectedFilter === filter.value"
                (click)="setFilter(filter.value)"
                class="filter-star px-6 py-3 rounded-full transition-all duration-300">
                <span class="text-lg mr-2">{{ filter.icon }}</span>
                {{ filter.name }}
              </button>
            </div>
          </div>

          <!-- Tours Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let tour of filteredTours; let i = index" 
                 [@cardFloat]
                 [style.animation-delay]="i * 0.1 + 's'"
                 class="tour-constellation group cursor-pointer"
                 [routerLink]="['/tours', tour.id]">
              
              <!-- Status Indicator -->
              <div class="absolute top-4 right-4 z-10">
                <div class="status-glow" [ngClass]="tour.status">
                  <span class="status-icon">{{ getStatusIcon(tour.status) }}</span>
                </div>
              </div>

              <!-- Tour Image -->
              <div class="tour-image-container">
                <div class="tour-image" 
                     [style.background-image]="tour.coverImage ? 'url(' + tour.coverImage + ')' : ''">
                  <div class="image-overlay"></div>
                  <div class="difficulty-badge" [ngClass]="tour.difficulty">
                    <span class="difficulty-icon">{{ getDifficultyIcon(tour.difficulty) }}</span>
                    <span class="difficulty-text">{{ getDifficultyText(tour.difficulty) }}</span>
                  </div>
                </div>
              </div>

              <!-- Tour Content -->
              <div class="tour-content">
                <div class="tour-header">
                  <h3 class="tour-title">{{ tour.title }}</h3>
                  <div class="tour-rating">
                    <div class="stars">
                      <span *ngFor="let star of getStarArray(tour.rating)" class="star">⭐</span>
                    </div>
                    <span class="review-count">({{ tour.reviewCount }})</span>
                  </div>
                </div>

                <p class="tour-description">{{ tour.description }}</p>

                <!-- Tour Stats -->
                <div class="tour-stats">
                  <div class="stat-item">
                    <span class="stat-icon">📏</span>
                    <span class="stat-value">{{ tour.length }}km</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-icon">🚶</span>
                    <span class="stat-value">{{ tour.walkingDuration }}</span>
                  </div>
                  <div class="stat-item" *ngIf="tour.bikingDuration">
                    <span class="stat-icon">🚲</span>
                    <span class="stat-value">{{ tour.bikingDuration }}</span>
                  </div>
                </div>

                <!-- Tags -->
                <div class="tour-tags">
                  <span *ngFor="let tag of tour.tags.slice(0, 3)" class="tag">{{ tag }}</span>
                  <span *ngIf="tour.tags.length > 3" class="tag-more">+{{ tour.tags.length - 3 }}</span>
                </div>

                <!-- Author & Price -->
                <div class="tour-footer">
                  <div class="author-info">
                    <div class="author-avatar" [style.background-image]="tour.author.avatar ? 'url(' + tour.author.avatar + ')' : ''">
                      <span *ngIf="!tour.author.avatar" class="avatar-placeholder">{{ tour.author.name[0] }}</span>
                    </div>
                    <span class="author-name">{{ tour.author.name }}</span>
                  </div>
                  <div class="price-info">
                    <span class="price" [class.free]="tour.price === 0">
                      {{ tour.price === 0 ? 'Besplatno' : tour.price + ' RSD' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Hover Glow Effect -->
              <div class="constellation-glow"></div>
            </div>
          </div>

          <!-- Create Tour Button -->
          <div class="text-center mt-16">
            <a routerLink="/tours/create" 
               class="glass-button glass-button-primary px-12 py-4 text-lg font-light tracking-wide group inline-flex items-center space-x-3">
              <span class="text-2xl group-hover:scale-110 transition-transform">➕</span>
              <span>Kreirajte Novu Turu</span>
            </a>
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
      opacity: 0.7;
    }
    
    .particle.type-1 {
      background: radial-gradient(circle, rgba(96, 165, 250, 0.8) 0%, transparent 70%);
      animation: float1 8s infinite ease-in-out;
    }
    
    .particle.type-2 {
      background: radial-gradient(circle, rgba(52, 211, 153, 0.6) 0%, transparent 70%);
      animation: float2 12s infinite ease-in-out;
    }
    
    .particle.type-3 {
      background: radial-gradient(circle, rgba(167, 139, 250, 0.5) 0%, transparent 70%);
      animation: float3 10s infinite ease-in-out;
    }
    
    @keyframes float1 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
      25% { transform: translate(100px, -50px) scale(1.2); opacity: 1; }
      50% { transform: translate(-50px, -100px) scale(0.8); opacity: 0.5; }
      75% { transform: translate(-80px, 50px) scale(1.1); opacity: 0.8; }
    }
    
    @keyframes float2 {
      0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
      33% { transform: translate(-120px, -80px) rotate(120deg); opacity: 1; }
      66% { transform: translate(80px, -60px) rotate(240deg); opacity: 0.4; }
    }
    
    @keyframes float3 {
      0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; }
      50% { transform: translate(60px, -120px) scale(1.5) rotate(180deg); opacity: 1; }
    }
    
    .glass-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      box-shadow: 
        0 0 40px rgba(96, 165, 250, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .filter-star {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: rgba(255, 255, 255, 0.8);
      font-weight: 300;
    }
    
    .filter-star:hover, .filter-star.active {
      background: rgba(96, 165, 250, 0.2);
      border-color: rgba(96, 165, 250, 0.4);
      color: white;
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
    }
    
    .tour-constellation {
      position: relative;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      overflow: hidden;
      transition: all 0.4s ease;
      animation: cardHover 6s ease-in-out infinite;
    }
    
    .tour-constellation:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 
        0 20px 40px rgba(96, 165, 250, 0.2),
        0 0 60px rgba(52, 211, 153, 0.1);
    }
    
    .tour-constellation:hover .constellation-glow {
      opacity: 1;
    }
    
    .constellation-glow {
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      border-radius: 1.5rem;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: -1;
      animation: glowPulse 3s ease-in-out infinite;
    }
    
    @keyframes cardHover {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    
    @keyframes glowPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    
    .status-glow {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .status-glow.draft {
      background: rgba(156, 163, 175, 0.3);
      box-shadow: 0 0 20px rgba(156, 163, 175, 0.4);
    }
    
    .status-glow.published {
      background: rgba(34, 197, 94, 0.3);
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
    }
    
    .status-glow.archived {
      background: rgba(239, 68, 68, 0.3);
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    }
    
    .status-icon {
      font-size: 1.2rem;
    }
    
    .tour-image-container {
      position: relative;
      height: 12rem;
      overflow: hidden;
    }
    
    .tour-image {
      height: 100%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(52, 211, 153, 0.2));
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.3) 100%
      );
    }
    
    .difficulty-badge {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 300;
    }
    
    .difficulty-badge.easy {
      background: rgba(34, 197, 94, 0.3);
      color: rgb(74, 222, 128);
    }
    
    .difficulty-badge.medium {
      background: rgba(251, 191, 36, 0.3);
      color: rgb(253, 224, 71);
    }
    
    .difficulty-badge.hard {
      background: rgba(239, 68, 68, 0.3);
      color: rgb(248, 113, 113);
    }
    
    .tour-content {
      padding: 1.5rem;
    }
    
    .tour-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    
    .tour-title {
      font-size: 1.25rem;
      font-weight: 400;
      color: white;
      line-height: 1.4;
      flex: 1;
      margin-right: 1rem;
    }
    
    .tour-rating {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    
    .stars {
      display: flex;
      gap: 0.125rem;
    }
    
    .star {
      font-size: 0.875rem;
      filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5));
    }
    
    .review-count {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .tour-description {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      font-weight: 300;
    }
    
    .tour-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      font-weight: 300;
    }
    
    .stat-icon {
      font-size: 1rem;
    }
    
    .tour-tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    
    .tag {
      padding: 0.25rem 0.75rem;
      background: rgba(96, 165, 250, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.3);
      border-radius: 1rem;
      font-size: 0.75rem;
      color: rgba(96, 165, 250, 0.9);
      font-weight: 300;
    }
    
    .tag-more {
      padding: 0.25rem 0.75rem;
      background: rgba(148, 163, 184, 0.2);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 1rem;
      font-size: 0.75rem;
      color: rgba(148, 163, 184, 0.9);
      font-weight: 300;
    }
    
    .tour-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .author-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .author-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .avatar-placeholder {
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .author-name {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      font-weight: 300;
    }
    
    .price-info {
      text-align: right;
    }
    
    .price {
      color: rgba(34, 197, 94, 0.9);
      font-weight: 500;
      font-size: 1rem;
    }
    
    .price.free {
      color: rgba(96, 165, 250, 0.9);
    }
    
    .glass-button {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 50px;
      transition: all 0.3s ease;
      text-decoration: none;
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
    
    .cosmic-glow {
      filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
      animation: iconGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes iconGlow {
      from { filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5)); }
      to { filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.7)); }
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
  `],
  animations: [
    trigger('starBurst', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5) rotate(-180deg)' }),
        animate('1s ease-out', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' }))
      ])
    ]),
    trigger('cardFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px) scale(0.9)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
})
export class TourFeedComponent implements OnInit {
  particles: Particle[] = [];
  mouseX: number = 0;
  mouseY: number = 0;
  selectedFilter: string = 'all';

  filters = [
    { value: 'all', name: 'Sve Ture', icon: '🌍' },
    { value: 'easy', name: 'Lako', icon: '🌱' },
    { value: 'medium', name: 'Srednje', icon: '⛰️' },
    { value: 'hard', name: 'Teško', icon: '🏔️' },
    { value: 'published', name: 'Objavljeno', icon: '🌟' },
    { value: 'free', name: 'Besplatno', icon: '🎁' }
  ];

  tours: Tour[] = [
    {
      id: '1',
      title: 'Magični Beograd: Kroz Istoriju i Kulturu',
      description: 'Otkrijte skrivene bisere glavnog grada kroz nezaboravnu šetnju kroz Stari Grad, Kalemegdan i bohemski Skadarliju.',
      difficulty: 'easy',
      tags: ['istorija', 'kultura', 'porodica', 'grad'],
      status: 'published',
      length: 5.2,
      walkingDuration: '3h',
      bikingDuration: '1h 15min',
      price: 1500,
      author: { name: 'Marko Petrović' },
      createdAt: new Date(),
      rating: 4.8,
      reviewCount: 127
    },
    {
      id: '2',
      title: 'Divlja Lepota Tare: Kanjon Drine',
      description: 'Avanturističko putovanje kroz netaknutu prirodu nacionalnog parka Tara sa spektakularnim pogledom na kanjon Drine.',
      difficulty: 'hard',
      tags: ['priroda', 'avantura', 'planine', 'foto'],
      status: 'published',
      length: 12.8,
      walkingDuration: '6h 30min',
      bikingDuration: '3h',
      price: 3500,
      author: { name: 'Ana Jovanović' },
      createdAt: new Date(),
      rating: 4.9,
      reviewCount: 89
    },
    {
      id: '3',
      title: 'Fruška Gora: Manastiri i Vinogradi',
      description: 'Kulturno-gastronomska tura kroz najlepše manastire Fruške Gore uz degustaciju autohtonih vina.',
      difficulty: 'medium',
      tags: ['manastiri', 'vino', 'kultura', 'gastronomija'],
      status: 'published',
      length: 8.5,
      walkingDuration: '4h 45min',
      bikingDuration: '2h 15min',
      price: 2800,
      author: { name: 'Stefan Nikolić' },
      createdAt: new Date(),
      rating: 4.7,
      reviewCount: 156
    },
    {
      id: '4',
      title: 'Zlatibor: Planinski Raj za Porodice',
      description: 'Idealna tura za porodice sa decom kroz najlepše predele Zlatibora sa posećivanjem Stopića pećine.',
      difficulty: 'easy',
      tags: ['porodica', 'planine', 'priroda', 'deca'],
      status: 'published',
      length: 6.3,
      walkingDuration: '3h 30min',
      bikingDuration: '1h 45min',
      price: 0,
      author: { name: 'Milica Stojanović' },
      createdAt: new Date(),
      rating: 4.6,
      reviewCount: 203
    },
    {
      id: '5',
      title: 'Novi Sad: Petrovaradin i Dunav',
      description: 'Šarmantan obilazak Novog Sada sa posetom Petrovaradinskoj tvrđavi i šetnjom duž Dunava.',
      difficulty: 'easy',
      tags: ['grad', 'istorija', 'Dunav', 'tvrđava'],
      status: 'draft',
      length: 4.7,
      walkingDuration: '2h 45min',
      bikingDuration: '1h',
      price: 0,
      author: { name: 'Đorđe Milosavljević' },
      createdAt: new Date(),
      rating: 0,
      reviewCount: 0
    }
  ];

  get filteredTours(): Tour[] {
    if (this.selectedFilter === 'all') return this.tours;
    if (this.selectedFilter === 'free') return this.tours.filter(tour => tour.price === 0);
    if (['easy', 'medium', 'hard'].includes(this.selectedFilter)) {
      return this.tours.filter(tour => tour.difficulty === this.selectedFilter);
    }
    if (['draft', 'published', 'archived'].includes(this.selectedFilter)) {
      return this.tours.filter(tour => tour.status === this.selectedFilter);
    }
    return this.tours;
  }

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

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'draft': return '📝';
      case 'published': return '🌟';
      case 'archived': return '📦';
      default: return '📝';
    }
  }

  getDifficultyIcon(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '🌱';
      case 'medium': return '⛰️';
      case 'hard': return '🏔️';
      default: return '🌱';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Lako';
      case 'medium': return 'Srednje';
      case 'hard': return 'Teško';
      default: return 'Lako';
    }
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}