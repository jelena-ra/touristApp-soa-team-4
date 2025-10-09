import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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

interface KeyPoint {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  image?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  images?: string[];
  date: Date;
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
  carDuration: string;
  price: number;
  coverImage?: string;
  keyPoints: KeyPoint[];
  author: {
    name: string;
    avatar?: string;
    motto: string;
  };
  reviews: Review[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

@Component({
  selector: 'app-tour-detail',
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
      <div class="relative z-10 min-h-screen" *ngIf="tour">
        
        <!-- Hero Section -->
        <div class="relative h-96 overflow-hidden">
          <div class="absolute inset-0 tour-hero-bg" 
               [style.background-image]="tour.coverImage ? 'url(' + tour.coverImage + ')' : ''">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          </div>
          
          <div class="relative z-10 h-full flex items-end">
            <div class="max-w-7xl mx-auto px-6 pb-12 w-full">
              <div class="flex items-end justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="status-glow" [ngClass]="tour.status">
                      <span class="status-icon">{{ getStatusIcon(tour.status) }}</span>
                    </div>
                    <div class="difficulty-badge" [ngClass]="tour.difficulty">
                      <span class="difficulty-icon">{{ getDifficultyIcon(tour.difficulty) }}</span>
                      <span class="difficulty-text">{{ getDifficultyText(tour.difficulty) }}</span>
                    </div>
                  </div>
                  
                  <h1 class="text-5xl md:text-6xl font-thin text-white mb-4 tracking-wide animate-glow">
                    {{ tour.title }}
                  </h1>
                  <div class="cosmic-line mb-6"></div>
                  <p class="text-xl text-gray-300 font-light max-w-3xl">
                    {{ tour.description }}
                  </p>
                </div>
                
                <div class="text-right" *ngIf="tour.status === 'published'">
                  <div class="price-display mb-4">
                    <span class="price-label">Cena</span>
                    <span class="price-value" [class.free]="tour.price === 0">
                      {{ tour.price === 0 ? 'Besplatno' : tour.price + ' RSD' }}
                    </span>
                  </div>
                  <button class="glass-button glass-button-primary px-8 py-3 text-lg font-light">
                    <span class="flex items-center space-x-2">
                      <span>🛒</span>
                      <span>Dodaj u Korpu</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-12">
          
          <!-- Tour Stats & Info -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            <!-- Stats Cards -->
            <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="stat-constellation">
                <div class="stat-icon-container">
                  <span class="stat-icon">📏</span>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Dužina Rute</span>
                  <span class="stat-value">{{ tour.length }} km</span>
                </div>
              </div>
              
              <div class="stat-constellation">
                <div class="stat-icon-container">
                  <span class="stat-icon">🚶</span>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Pešice</span>
                  <span class="stat-value">{{ tour.walkingDuration }}</span>
                </div>
              </div>
              
              <div class="stat-constellation">
                <div class="stat-icon-container">
                  <span class="stat-icon">🚲</span>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Biciklom</span>
                  <span class="stat-value">{{ tour.bikingDuration }}</span>
                </div>
              </div>
              
              <div class="stat-constellation">
                <div class="stat-icon-container">
                  <span class="stat-icon">🚗</span>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Automobilom</span>
                  <span class="stat-value">{{ tour.carDuration }}</span>
                </div>
              </div>
              
              <div class="stat-constellation">
                <div class="stat-icon-container">
                  <span class="stat-icon">⭐</span>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Ocena</span>
                  <span class="stat-value">{{ tour.rating }}/5</span>
                </div>
              </div>
              
              <div class="stat-constellation">
                <div class="stat-icon-container">
                  <span class="stat-icon">👥</span>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Recenzije</span>
                  <span class="stat-value">{{ tour.reviewCount }}</span>
                </div>
              </div>
            </div>

            <!-- Author Info -->
            <div class="author-constellation">
              <div class="author-header">
                <div class="author-avatar" [style.background-image]="tour.author.avatar ? 'url(' + tour.author.avatar + ')' : ''">
                  <span *ngIf="!tour.author.avatar" class="avatar-placeholder">{{ tour.author.name[0] }}</span>
                </div>
                <div class="author-info">
                  <h3 class="author-name">{{ tour.author.name }}</h3>
                  <p class="author-title">Kreator Ture</p>
                </div>
              </div>
              <p class="author-motto">"{{ tour.author.motto }}"</p>
              <div class="author-stats">
                <div class="author-stat">
                  <span class="stat-number">{{ getAuthorTourCount() }}</span>
                  <span class="stat-label">Ture</span>
                </div>
                <div class="author-stat">
                  <span class="stat-number">{{ getAuthorRating() }}</span>
                  <span class="stat-label">Ocena</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="mb-12">
            <h2 class="section-title mb-6">Tagovi</h2>
            <div class="tour-tags">
              <span *ngFor="let tag of tour.tags" class="tag">{{ tag }}</span>
            </div>
          </div>

          <!-- Interactive Map Section -->
          <div class="mb-16">
            <h2 class="section-title mb-8">Mapa Rute sa Ključnim Tačkama</h2>
            <div class="map-constellation">
              <div class="map-placeholder">
                <div class="map-overlay">
                  <span class="map-icon">🗺️</span>
                  <p class="map-text">Interaktivna mapa će biti prikazana ovde</p>
                  <p class="map-subtext">Ključne tačke: {{ tour.keyPoints.length }}</p>
                </div>
                
                <!-- Glow Path Visualization -->
                <div class="path-glow"></div>
              </div>
            </div>
          </div>

          <!-- Key Points -->
          <div class="mb-16">
            <h2 class="section-title mb-8">Ključne Tačke na Ruti</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div *ngFor="let point of tour.keyPoints; let i = index" 
                   [@pointReveal]
                   [style.animation-delay]="i * 0.1 + 's'"
                   class="key-point-constellation">
                <div class="point-header">
                  <div class="point-number">{{ i + 1 }}</div>
                  <h3 class="point-name">{{ point.name }}</h3>
                </div>
                <p class="point-description">{{ point.description }}</p>
                <div class="point-coordinates">
                  <span class="coordinate-label">📍 Koordinate:</span>
                  <span class="coordinate-value">{{ point.coordinates.lat }}, {{ point.coordinates.lng }}</span>
                </div>
                <div *ngIf="point.image" class="point-image" [style.background-image]="'url(' + point.image + ')'"></div>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="mb-16">
            <h2 class="section-title mb-8">Recenzije Putnika</h2>
            <div class="space-y-6">
              <div *ngFor="let review of tour.reviews; let i = index" 
                   [@reviewSlide]
                   [style.animation-delay]="i * 0.15 + 's'"
                   class="review-constellation">
                <div class="review-header">
                  <div class="reviewer-info">
                    <div class="reviewer-avatar" [style.background-image]="review.reviewer.avatar ? 'url(' + review.reviewer.avatar + ')' : ''">
                      <span *ngIf="!review.reviewer.avatar" class="avatar-placeholder">{{ review.reviewer.name[0] }}</span>
                    </div>
                    <div>
                      <h4 class="reviewer-name">{{ review.reviewer.name }}</h4>
                      <p class="review-date">{{ formatDate(review.date) }}</p>
                    </div>
                  </div>
                  <div class="review-rating">
                    <div class="stars">
                      <span *ngFor="let star of getStarArray(review.rating)" class="star">⭐</span>
                    </div>
                  </div>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
                <div *ngIf="review.images && review.images.length > 0" class="review-images">
                  <div *ngFor="let image of review.images" 
                       class="review-image" 
                       [style.background-image]="'url(' + image + ')'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Purchase Options -->
          <div class="purchase-constellation" *ngIf="tour.status === 'published'">
            <div class="purchase-header">
              <h2 class="section-title">Rezervišite Svoju Avanturu</h2>
              <div class="price-highlight">
                <span class="price-value" [class.free]="tour.price === 0">
                  {{ tour.price === 0 ? 'Besplatno' : tour.price + ' RSD' }}
                </span>
              </div>
            </div>
            
            <div class="purchase-actions">
              <button class="glass-button glass-button-primary purchase-btn">
                <span class="flex items-center space-x-3">
                  <span class="text-2xl">🛒</span>
                  <span>Dodaj u Korpu</span>
                </span>
              </button>
              <button class="glass-button glass-button-secondary purchase-btn">
                <span class="flex items-center space-x-3">
                  <span class="text-2xl">⚡</span>
                  <span>Kupi Odmah</span>
                </span>
              </button>
              <button class="glass-button glass-button-tertiary purchase-btn">
                <span class="flex items-center space-x-3">
                  <span class="text-2xl">🎁</span>
                  <span>Poklon Token</span>
                </span>
              </button>
            </div>
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
    
    .tour-hero-bg {
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
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
    
    .difficulty-badge {
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      gap: 0.75rem;
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
    
    .price-display {
      text-align: right;
    }
    
    .price-label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .price-value {
      color: rgba(34, 197, 94, 0.9);
      font-size: 2rem;
      font-weight: 300;
      display: block;
    }
    
    .price-value.free {
      color: rgba(96, 165, 250, 0.9);
    }
    
    .section-title {
      font-size: 2rem;
      font-weight: 300;
      color: white;
      text-align: center;
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent);
    }
    
    .stat-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }
    
    .stat-constellation:hover {
      transform: translateY(-2px);
      border-color: rgba(96, 165, 250, 0.3);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    }
    
    .stat-icon-container {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: rgba(96, 165, 250, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .stat-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .stat-value {
      color: white;
      font-size: 1.25rem;
      font-weight: 300;
    }
    
    .author-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 2rem;
    }
    
    .author-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .author-avatar {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .avatar-placeholder {
      color: white;
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    .author-name {
      color: white;
      font-size: 1.25rem;
      font-weight: 400;
      margin-bottom: 0.25rem;
    }
    
    .author-title {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    .author-motto {
      color: rgba(255, 255, 255, 0.8);
      font-style: italic;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .author-stats {
      display: flex;
      gap: 2rem;
    }
    
    .author-stat {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      color: rgba(96, 165, 250, 0.9);
      font-size: 1.5rem;
      font-weight: 400;
    }
    
    .tour-tags {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .tag {
      padding: 0.5rem 1.25rem;
      background: rgba(96, 165, 250, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.3);
      border-radius: 2rem;
      font-size: 0.875rem;
      color: rgba(96, 165, 250, 0.9);
      font-weight: 300;
    }
    
    .map-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      overflow: hidden;
    }
    
    .map-placeholder {
      height: 24rem;
      position: relative;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(52, 211, 153, 0.1));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .map-overlay {
      text-align: center;
      color: white;
      z-index: 2;
      position: relative;
    }
    
    .map-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
      filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.5));
    }
    
    .map-text {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: 300;
    }
    
    .map-subtext {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    .path-glow {
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, 
        transparent 30%, 
        rgba(96, 165, 250, 0.1) 50%, 
        transparent 70%);
      animation: pathFlow 4s ease-in-out infinite;
    }
    
    @keyframes pathFlow {
      0%, 100% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
    }
    
    .key-point-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    
    .key-point-constellation:hover {
      transform: translateY(-4px);
      border-color: rgba(96, 165, 250, 0.3);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    }
    
    .point-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .point-number {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: rgba(96, 165, 250, 0.3);
      border: 1px solid rgba(96, 165, 250, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
      box-shadow: 0 0 15px rgba(96, 165, 250, 0.3);
    }
    
    .point-name {
      color: white;
      font-size: 1.25rem;
      font-weight: 400;
    }
    
    .point-description {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 1rem;
      font-weight: 300;
    }
    
    .point-coordinates {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .coordinate-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    .coordinate-value {
      color: rgba(96, 165, 250, 0.9);
      font-size: 0.875rem;
      font-family: monospace;
    }
    
    .point-image {
      height: 8rem;
      border-radius: 0.75rem;
      background-size: cover;
      background-position: center;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    
    .review-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .reviewer-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .reviewer-name {
      color: white;
      font-size: 1rem;
      font-weight: 400;
      margin-bottom: 0.25rem;
    }
    
    .review-date {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
    }
    
    .review-rating .stars {
      display: flex;
      gap: 0.125rem;
    }
    
    .star {
      font-size: 1rem;
      filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5));
    }
    
    .review-comment {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 1rem;
      font-weight: 300;
    }
    
    .review-images {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    
    .review-image {
      width: 4rem;
      height: 4rem;
      border-radius: 0.5rem;
      background-size: cover;
      background-position: center;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    
    .purchase-constellation {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(96, 165, 250, 0.3);
      border-radius: 2rem;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 0 40px rgba(96, 165, 250, 0.2);
    }
    
    .purchase-header {
      margin-bottom: 2rem;
    }
    
    .price-highlight .price-value {
      font-size: 3rem;
      font-weight: 300;
      color: rgba(34, 197, 94, 0.9);
    }
    
    .price-highlight .price-value.free {
      color: rgba(96, 165, 250, 0.9);
    }
    
    .purchase-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    
    .purchase-btn {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }
    
    .glass-button {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 50px;
      transition: all 0.3s ease;
      text-decoration: none;
      cursor: pointer;
    }
    
    .glass-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
      border-color: rgba(96, 165, 250, 0.4);
    }
    
    .glass-button-primary {
      color: white;
      background: rgba(96, 165, 250, 0.2);
      border-color: rgba(96, 165, 250, 0.4);
    }
    
    .glass-button-secondary {
      color: white;
      background: rgba(52, 211, 153, 0.2);
      border-color: rgba(52, 211, 153, 0.4);
    }
    
    .glass-button-tertiary {
      color: white;
      background: rgba(167, 139, 250, 0.2);
      border-color: rgba(167, 139, 250, 0.4);
    }
    
    .cosmic-line {
      width: 200px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), rgba(52, 211, 153, 0.5), transparent);
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
    trigger('pointReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('reviewSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class TourDetailComponent implements OnInit {
  particles: Particle[] = [];
  mouseX: number = 0;
  mouseY: number = 0;
  tour: Tour | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
    this.loadTourData();
  }

  loadTourData() {
    // Mock data - in real app, load from service based on route params
    this.tour = {
      id: '1',
      title: 'Magični Beograd: Kroz Istoriju i Kulturu',
      description: 'Otkrijte skrivene bisere glavnog grada kroz nezaboravnu šetnju kroz Stari Grad, Kalemegdan i bohemski Skadarliju. Ova tura vas vodi kroz najznačajnije istorijske lokacije, kulturne spomenike i tradicionalne kafane.',
      difficulty: 'easy',
      tags: ['istorija', 'kultura', 'porodica', 'grad', 'arhitektura', 'gastronomija'],
      status: 'published',
      length: 5.2,
      walkingDuration: '3h',
      bikingDuration: '1h 15min',
      carDuration: '45min',
      price: 1500,
      keyPoints: [
        {
          id: '1',
          name: 'Kalemegdan Tvrđava',
          description: 'Jedna od najznačajnijih i najbolje očuvanih tvrđava u Evropi. Odavde se pruža spektakularan pogled na ušće Save u Dunav.',
          coordinates: { lat: 44.8225, lng: 20.4502 }
        },
        {
          id: '2',
          name: 'Knez Mihailova Ulica',
          description: 'Glavna pešačka zona i trgovačka ulica u centru Beograda, zaštićena kao prostorno kulturno-istorijsko dobro.',
          coordinates: { lat: 44.8176, lng: 20.4583 }
        },
        {
          id: '3',
          name: 'Skadarlija',
          description: 'Bohemska četvrt Beograda, poznata po tradicionalnim kafanama, muzici i umetničkoj atmosferi.',
          coordinates: { lat: 44.8186, lng: 20.4658 }
        },
        {
          id: '4',
          name: 'Hram Svetog Save',
          description: 'Jedan od najvećih pravoslavnih hramova na svetu, simbol srpske duhovnosti i arhitekture.',
          coordinates: { lat: 44.7982, lng: 20.4687 }
        }
      ],
      author: {
        name: 'Marko Petrović',
        motto: 'Svaki korak otkriva novu priču, svaki put vodi ka novom iskustvu.'
      },
      reviews: [
        {
          id: '1',
          rating: 5,
          comment: 'Fantastična tura! Marko je odličan vodič koji zna mnogo zanimljivih priča o Beogradu. Posebno mi se dopao deo o Kalemegdanu.',
          reviewer: { name: 'Ana Jovanović' },
          date: new Date('2024-08-15')
        },
        {
          id: '2',
          rating: 5,
          comment: 'Preporučujem svima koji žele da bolje upoznaju Beograd. Ruta je odlično osmišljena i pokriva sve važne lokacije.',
          reviewer: { name: 'Stefan Nikolić' },
          date: new Date('2024-08-20')
        },
        {
          id: '3',
          rating: 4,
          comment: 'Veoma zanimljivo iskustvo. Jedino što bih dodao je više vremena u Skadarliji za kafu.',
          reviewer: { name: 'Milica Stojanović' },
          date: new Date('2024-08-25')
        }
      ],
      rating: 4.8,
      reviewCount: 127,
      createdAt: new Date('2024-07-01')
    };
  }

  generateParticles() {
    const particleCount = 100;
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

  getAuthorTourCount(): number {
    return 12; // Mock data
  }

  getAuthorRating(): number {
    return 4.7; // Mock data
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('sr-RS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}