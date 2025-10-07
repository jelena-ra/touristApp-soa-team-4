import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface Stat {
  label: string;
  value: string;
  icon: string;
  trend: string;
  bgColor: string;
}

interface Activity {
  action: string;
  time: string;
  icon: string;
}

interface SystemMetric {
  name: string;
  value: number;
  icon: string;
  color: string;
  gradientColor: string;
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
  selector: 'app-dashboard',
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

      <!-- Main Content with Glass Effect -->
      <div class="relative z-10 min-h-screen p-8">
        
        <!-- Hero Section with Particle Text Effect -->
        <div class="relative text-center mb-16 pt-20">
          <div class="particle-text-container mb-8">
            <h1 class="text-6xl md:text-8xl font-thin tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-green-200 animate-glow">
              DOBRODOŠLI
            </h1>
            <div class="text-2xl md:text-3xl font-light text-blue-200 mt-4 opacity-80 animate-fade-in">
              {{ currentUser.name }}
            </div>
          </div>
          <div class="cosmic-line"></div>
          <p class="text-lg text-gray-300 mt-8 max-w-2xl mx-auto font-light leading-relaxed">
            Vaš lični centar za upravljanje turističkim avanturama i destinacijama
          </p>
        </div>

        <!-- Quick Actions - Floating Glass Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div *ngFor="let action of quickActions; let i = index" 
               class="cosmic-card group cursor-pointer"
               [style.animation-delay]="(i * 0.2) + 's'">
            <div class="glass-panel p-8 text-center relative overflow-hidden">
              <!-- Particle trail effect -->
              <div class="particle-trail"></div>
              
              <div class="cosmic-icon mb-6 group-hover:scale-110 transition-all duration-500">
                <span class="text-5xl block cosmic-glow">{{ action.icon }}</span>
              </div>
              
              <h3 class="text-xl font-light text-white mb-3 tracking-wide">{{ action.title }}</h3>
              <p class="text-sm text-gray-400 font-light leading-relaxed">{{ action.description }}</p>
              
              <!-- Hover effect particles -->
              <div class="absolute inset-0 pointer-events-none">
                <div class="hover-particles opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section - Constellation Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          
          <!-- Stats Constellation -->
          <div class="lg:col-span-2">
            <div class="glass-panel p-10 relative">
              <div class="flex items-center mb-8">
                <div class="cosmic-icon mr-4">
                  <span class="text-3xl cosmic-glow">📊</span>
                </div>
                <h2 class="text-2xl font-light text-white tracking-wide">Statistike Putovanja</h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div *ngFor="let stat of stats; let i = index" 
                     class="stat-constellation"
                     [style.animation-delay]="(i * 0.3) + 's'">
                  <div class="flex items-center space-x-6">
                    <div class="cosmic-icon-large">
                      <span class="text-4xl cosmic-glow">{{ stat.icon }}</span>
                    </div>
                    <div>
                      <div class="text-4xl font-thin text-white mb-1 cosmic-number">{{ stat.value }}</div>
                      <div class="text-lg text-gray-300 font-light">{{ stat.label }}</div>
                      <div class="text-sm text-blue-300 mt-2 font-light cosmic-trend">{{ stat.trend }}</div>
                    </div>
                  </div>
                  <!-- Connecting line particles -->
                  <div class="constellation-line"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Stream -->
          <div>
            <div class="glass-panel p-10 relative">
              <div class="flex items-center mb-8">
                <div class="cosmic-icon mr-4">
                  <span class="text-3xl cosmic-glow">�</span>
                </div>
                <h2 class="text-2xl font-light text-white tracking-wide">Nedavna Aktivnost</h2>
              </div>
              
              <div class="space-y-6">
                <div *ngFor="let activity of recentActivity; let i = index" 
                     class="activity-particle"
                     [style.animation-delay]="(i * 0.4) + 's'">
                  <div class="flex items-center space-x-4">
                    <div class="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-green-400 cosmic-pulse"></div>
                    <div class="flex-1">
                      <div class="text-white font-light">{{ activity.action }}</div>
                      <div class="text-gray-400 text-sm font-light">pre {{ activity.time }}</div>
                    </div>
                  </div>
                  <!-- Activity trail -->
                  <div class="activity-trail"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Monitoring - Cosmic Grid -->
        <div class="glass-panel p-10 relative">
          <div class="flex items-center mb-8">
            <div class="cosmic-icon mr-4">
              <span class="text-3xl cosmic-glow">💻</span>
            </div>
            <h2 class="text-2xl font-light text-white tracking-wide">Sistemsko Praćenje</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div *ngFor="let metric of systemMetrics; let i = index" 
                 class="metric-constellation"
                 [style.animation-delay]="(i * 0.2) + 's'">
              <div class="text-center">
                <div class="cosmic-icon-large mb-6">
                  <span class="text-5xl cosmic-glow">{{ metric.icon }}</span>
                </div>
                <div class="text-lg text-gray-300 mb-4 font-light">{{ metric.name }}</div>
                
                <!-- Cosmic Progress Ring -->
                <div class="relative w-24 h-24 mx-auto mb-4">
                  <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <!-- Background ring -->
                    <circle cx="50" cy="50" r="40" stroke="rgba(55, 65, 81, 0.3)" 
                            stroke-width="8" fill="none"/>
                    <!-- Progress ring -->
                    <circle cx="50" cy="50" r="40" 
                            stroke="url(#cosmicGradient)" 
                            stroke-width="8" 
                            fill="none"
                            stroke-linecap="round"
                            [style.stroke-dasharray]="251.2"
                            [style.stroke-dashoffset]="251.2 - (251.2 * metric.value / 100)"
                            class="cosmic-progress"/>
                    <defs>
                      <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#60A5FA"/>
                        <stop offset="50%" style="stop-color:#34D399"/>
                        <stop offset="100%" style="stop-color:#A78BFA"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <!-- Percentage in center -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-thin text-white cosmic-number">{{ metric.value }}%</span>
                  </div>
                </div>
              </div>
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
    
    .glass-panel {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 20px;
      box-shadow: 
        0 0 40px rgba(96, 165, 250, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .cosmic-card {
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
    
    .cosmic-icon {
      position: relative;
    }
    
    .cosmic-icon-large {
      position: relative;
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
      width: 200px;
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
    
    .animate-fade-in {
      animation: fadeIn 2s ease-out 0.5s both;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .cosmic-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.7);
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 0 0 10px rgba(96, 165, 250, 0);
        transform: scale(1.1);
      }
    }
    
    .stat-constellation,
    .activity-particle,
    .metric-constellation {
      animation: cosmicFadeIn 1s ease-out forwards;
      opacity: 0;
      transform: translateX(-30px);
    }
    
    @keyframes cosmicFadeIn {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .cosmic-number {
      animation: numberGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes numberGlow {
      from { color: rgba(255, 255, 255, 0.9); }
      to { color: rgba(96, 165, 250, 1); }
    }
    
    .cosmic-trend {
      animation: trendPulse 2s ease-in-out infinite;
    }
    
    @keyframes trendPulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
    
    .cosmic-progress {
      animation: progressGlow 3s ease-in-out infinite alternate;
      transition: stroke-dashoffset 1s ease-out;
    }
    
    @keyframes progressGlow {
      from { filter: drop-shadow(0 0 5px rgba(96, 165, 250, 0.5)); }
      to { filter: drop-shadow(0 0 15px rgba(52, 211, 153, 0.8)); }
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
    
    .activity-trail {
      position: absolute;
      left: 8px;
      top: 20px;
      width: 1px;
      height: calc(100% - 20px);
      background: linear-gradient(to bottom, rgba(96, 165, 250, 0.5), transparent);
      animation: trailFlow 3s ease-in-out infinite;
    }
    
    @keyframes trailFlow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    
    .constellation-line {
      position: absolute;
      right: -20px;
      top: 50%;
      width: 40px;
      height: 1px;
      background: linear-gradient(90deg, rgba(96, 165, 250, 0.3), transparent);
      animation: constellationPulse 2s ease-in-out infinite;
    }
    
    @keyframes constellationPulse {
      0%, 100% { opacity: 0.3; width: 40px; }
      50% { opacity: 0.8; width: 60px; }
    }
    
    /* Responsive font sizing */
    @media (max-width: 768px) {
      .text-6xl { font-size: 3rem; }
      .text-8xl { font-size: 4rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser = {
    name: 'John Doe',
    role: 'vodič'
  };

  particles: Particle[] = [];
  mouseX: number = 0;
  mouseY: number = 0;

  quickActions: QuickAction[] = [
    {
      title: 'Kreiraj Turu',
      description: 'Napravite novu turističku rutu',
      icon: '�️',
      href: '/tours/create',
      color: 'bg-gradient-to-br from-blue-400 to-cyan-400'
    },
    {
      title: 'Napiš Blog',
      description: 'Podelite putna iskustva',
      icon: '✍️',
      href: '/blog/create',
      color: 'bg-gradient-to-br from-purple-400 to-blue-400'
    },
    {
      title: 'Istražite Destinacije',
      description: 'Otkrijte nova mesta',
      icon: '�',
      href: '/tours',
      color: 'bg-gradient-to-br from-green-400 to-blue-400'
    },
    {
      title: 'Zajednica',
      description: 'Povežite se sa putnicima',
      icon: '�',
      href: '/followers',
      color: 'bg-gradient-to-br from-pink-400 to-purple-400'
    }
  ];

  stats: Stat[] = [
    { label: 'Aktivne Ture', value: '12', icon: '�️', trend: '+2 ova nedelja', bgColor: 'from-blue-400 to-cyan-400' },
    { label: 'Objavljeni Blogovi', value: '5', icon: '✍️', trend: '+1 danas', bgColor: 'from-purple-400 to-blue-400' },
    { label: 'Pratilaca', value: '248', icon: '�', trend: '+15 ova nedelja', bgColor: 'from-green-400 to-blue-400' },
    { label: 'Ukupno Pregleda', value: '1,234', icon: '👁️', trend: '+89 danas', bgColor: 'from-pink-400 to-purple-400' }
  ];

  recentActivity: Activity[] = [
    { action: 'Nova destinacija dodana', time: '2 sata', icon: '�' },
    { action: 'Blog o Parizu objavljen', time: '5 sati', icon: '✍️' },
    { action: 'Novi pratilac se pridružio', time: '1 dan', icon: '�' },
    { action: 'Tura u Rimu završena', time: '2 dana', icon: '�️' }
  ];

  systemMetrics: SystemMetric[] = [
    { name: 'Performanse Servera', value: 65, icon: '🖥️', color: 'text-blue-400', gradientColor: 'from-blue-400 to-cyan-500' },
    { name: 'Memorija', value: 78, icon: '�', color: 'text-purple-400', gradientColor: 'from-purple-400 to-pink-500' },
    { name: 'Disk Prostor', value: 45, icon: '💿', color: 'text-green-400', gradientColor: 'from-green-400 to-blue-500' }
  ];

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
  }

  generateParticles() {
    const particleCount = 150;
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