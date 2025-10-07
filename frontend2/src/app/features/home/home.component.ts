import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative min-h-screen bg-black overflow-hidden">
      <!-- Animated Particle Background -->
      <div class="absolute inset-0 particle-container">
        <!-- Floating particles -->
        <div class="particle" *ngFor="let particle of particles; trackBy: trackParticle" 
             [style.left.px]="particle.x" 
             [style.top.px]="particle.y"
             [style.animation-delay]="particle.delay + 's'"
             [ngClass]="particle.type"></div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen flex flex-col">
        
        <!-- Hero Section -->
        <div class="flex-1 flex items-center justify-center px-8 pt-20">
          <div class="text-center max-w-6xl mx-auto">
            
            <!-- Main Hero -->
            <div class="mb-16">
              <h1 class="text-6xl md:text-8xl lg:text-9xl font-thin tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-green-200 animate-glow mb-8">
                WANDERLUST
              </h1>
              <div class="cosmic-line mb-8"></div>
              <p class="text-2xl md:text-3xl font-light text-gray-300 mb-4">
                Otkrijte svet kroz naše avanture
              </p>
              <p class="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                Pridružite se zajednici putnika, istražite neverovatne destinacije i podelite svoja iskustva
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <a routerLink="/auth/register" 
                 class="glass-button glass-button-primary group px-10 py-4 text-lg font-light tracking-wide">
                <span class="flex items-center space-x-3">
                  <span class="text-2xl group-hover:scale-110 transition-transform">�</span>
                  <span>Registruj Se</span>
                </span>
              </a>
              <a routerLink="/auth/login" 
                 class="glass-button glass-button-secondary group px-10 py-4 text-lg font-light tracking-wide">
                <span class="flex items-center space-x-3">
                  <span class="text-2xl group-hover:scale-110 transition-transform">🔑</span>
                  <span>Uloguj Se</span>
                </span>
              </a>
              <a routerLink="/tours" 
                 class="glass-button glass-button-secondary group px-8 py-3 text-base font-light tracking-wide opacity-80">
                <span class="flex items-center space-x-2">
                  <span class="text-xl group-hover:scale-110 transition-transform">🗺️</span>
                  <span>Istražite Ture</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="py-20 px-8">
          <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-light text-white text-center mb-4 tracking-wide">
              Zašto Odabrati Nas
            </h2>
            <div class="cosmic-line-small mx-auto mb-16"></div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div *ngFor="let feature of features; let i = index" 
                   class="feature-card group"
                   [style.animation-delay]="(i * 0.2) + 's'">
                <div class="glass-panel p-8 text-center relative overflow-hidden h-full">
                  <!-- Particle trail effect -->
                  <div class="particle-trail"></div>
                  
                  <div class="feature-icon mb-6 group-hover:scale-110 transition-all duration-500">
                    <div class="w-16 h-16 mx-auto rounded-xl {{ feature.color }} flex items-center justify-center shadow-lg mb-4">
                      <span class="text-3xl cosmic-glow">{{ feature.icon }}</span>
                    </div>
                  </div>
                  
                  <h3 class="text-xl font-light text-white mb-4 tracking-wide">{{ feature.title }}</h3>
                  <p class="text-sm text-gray-400 font-light leading-relaxed">{{ feature.description }}</p>
                  
                  <!-- Hover effect particles -->
                  <div class="absolute inset-0 pointer-events-none">
                    <div class="hover-particles opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="py-20 px-8">
          <div class="max-w-4xl mx-auto">
            <div class="glass-panel p-12 text-center">
              <h2 class="text-3xl font-light text-white mb-8 tracking-wide">Naša Zajednica</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="stat-item">
                  <div class="text-5xl font-thin text-white mb-2 cosmic-number">500+</div>
                  <div class="text-lg text-gray-300 font-light">Destinacija</div>
                </div>
                <div class="stat-item">
                  <div class="text-5xl font-thin text-white mb-2 cosmic-number">10K+</div>
                  <div class="text-lg text-gray-300 font-light">Putnika</div>
                </div>
                <div class="stat-item">
                  <div class="text-5xl font-thin text-white mb-2 cosmic-number">25K+</div>
                  <div class="text-lg text-gray-300 font-light">Avantura</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="py-20 px-8">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-4xl font-light text-white mb-6 tracking-wide">
              Spremni za Avanturu?
            </h2>
            <p class="text-xl text-gray-300 mb-12 font-light">
              Započnite svoje putovanje danas i otkrijte svet kakav nikad niste videli
            </p>
            <a routerLink="/register" 
               class="glass-button glass-button-primary inline-block px-12 py-5 text-xl font-light tracking-wide">
              <span class="flex items-center space-x-3">
                <span class="text-3xl">🚀</span>
                <span>Započni Putovanje</span>
              </span>
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
      0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
      50% { transform: translate(60px, -120px) scale(1.5) rotate(180deg); opacity: 1; }
    }
    
    .glass-panel {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 20px;
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
    
    .feature-card {
      animation: cosmicRise 1s ease-out forwards;
      opacity: 0;
      transform: translateY(50px);
    }
    
    @keyframes cosmicRise {
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
    
    .cosmic-line-small {
      width: 150px;
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
    
    .cosmic-number {
      animation: numberGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes numberGlow {
      from { color: rgba(255, 255, 255, 0.9); }
      to { color: rgba(96, 165, 250, 1); }
    }
    
    .particle-trail {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      background: radial-gradient(circle at center, rgba(96, 165, 250, 0.1) 0%, transparent 50%);
      animation: trailPulse 4s ease-in-out infinite;
    }
    
    @keyframes trailPulse {
      0%, 100% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    
    .hover-particles {
      background: radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%);
      animation: hoverParticles 2s ease-in-out infinite;
    }
    
    @keyframes hoverParticles {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(180deg); }
    }
    
    .stat-item {
      animation: statFadeIn 1s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }
    
    @keyframes statFadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Responsive font sizing */
    @media (max-width: 768px) {
      .text-6xl { font-size: 3rem; }
      .text-8xl { font-size: 4rem; }
      .text-9xl { font-size: 5rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  particles: Particle[] = [];
  mouseX: number = 0;
  mouseY: number = 0;

  features: Feature[] = [
    {
      icon: '🌍',
      title: 'Otkrijte Svet',
      description: 'Istražite jedinstvene destinacije i skrivene dragulj širom sveta',
      color: 'bg-gradient-to-br from-blue-400 to-cyan-400'
    },
    {
      icon: '🗺️',
      title: 'Planiranje Tura',
      description: 'Rezervišite neverovatne ture i iskustva sa provjerenim vodičima',
      color: 'bg-gradient-to-br from-green-400 to-blue-400'
    },
    {
      icon: '✍️',
      title: 'Podelite Priče',
      description: 'Dokumentujte svoja putovanja i inspirišite druge putnike',
      color: 'bg-gradient-to-br from-purple-400 to-pink-400'
    },
    {
      icon: '👥',
      title: 'Zajednica',
      description: 'Povežite se sa putnicima i napravite nova prijateljstva',
      color: 'bg-gradient-to-br from-yellow-400 to-orange-400'
    }
  ];

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
  }

  generateParticles() {
    const particleCount = 100;
    this.particles = [];
    
    // Check if running in browser environment
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
      
      if (distance < 150) {
        // Repel particles from mouse
        const force = (150 - distance) / 150;
        particle.targetX = particle.x - (dx / distance) * force * 50;
        particle.targetY = particle.y - (dy / distance) * force * 50;
      } else {
        // Return to original position
        particle.targetX = particle.x;
        particle.targetY = particle.y;
      }
    });
  }

  animateParticles() {
    if (typeof window !== 'undefined') {
      const animate = () => {
        this.particles.forEach(particle => {
          // Smooth movement towards target
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;
          
          particle.vx += dx * 0.01;
          particle.vy += dy * 0.01;
          
          // Add some damping
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