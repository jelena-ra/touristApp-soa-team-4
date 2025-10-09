import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
      <div class="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div [@fadeIn] class="w-full max-w-lg">
          <div class="glass-panel p-12 rounded-3xl">
            
            <!-- Header -->
            <div class="text-center mb-10">
              <div [@iconPop] class="w-20 h-20 mx-auto mb-6 flex items-center justify-center cosmic-glow">
                <span class="text-5xl">✨</span>
              </div>
              <h2 class="text-4xl font-thin text-white mb-4 tracking-wide animate-glow">
                Pridružite Se Avanturu
              </h2>
              <div class="cosmic-line-small mx-auto mb-6"></div>
              <p class="text-lg text-gray-300 font-light">
                Napravite nalog i počnite svoju nezaboravnu avanturu kroz svet
              </p>
            </div>

            <!-- Register Form -->
            <form class="space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              
              <!-- Name Field -->
              <div class="space-y-3">
                <label for="name" class="block text-sm font-light text-gray-300 tracking-wide">
                  Puno ime
                </label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  required
                  class="glass-input w-full px-6 py-4 bg-transparent border border-gray-600/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  placeholder="Unesite vaše puno ime"
                />
              </div>

              <!-- Email Field -->
              <div class="space-y-3">
                <label for="email" class="block text-sm font-light text-gray-300 tracking-wide">
                  Email adresa
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  required
                  class="glass-input w-full px-6 py-4 bg-transparent border border-gray-600/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  placeholder="Unesite vašu email adresu"
                />
              </div>

              <!-- Password Field -->
              <div class="space-y-3">
                <label for="password" class="block text-sm font-light text-gray-300 tracking-wide">
                  Lozinka
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    required
                    class="glass-input w-full px-6 py-4 bg-transparent border border-gray-600/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 pr-14"
                    placeholder="Napravite sigurnu lozinku"
                  />
                  <button 
                    type="button" 
                    (click)="toggleShowPassword()" 
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none">
                    <span *ngIf="showPassword" class="text-xl">🙈</span>
                    <span *ngIf="!showPassword" class="text-xl">👁️</span>
                  </button>
                </div>
              </div>

              <!-- Confirm Password Field -->
              <div class="space-y-3">
                <label for="confirmPassword" class="block text-sm font-light text-gray-300 tracking-wide">
                  Potvrdite lozinku
                </label>
                <div class="relative">
                  <input
                    id="confirmPassword"
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    required
                    class="glass-input w-full px-6 py-4 bg-transparent border border-gray-600/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 pr-14"
                    placeholder="Potvrdite vašu lozinku"
                  />
                  <button 
                    type="button" 
                    (click)="toggleShowConfirmPassword()" 
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none">
                    <span *ngIf="showConfirmPassword" class="text-xl">🙈</span>
                    <span *ngIf="!showConfirmPassword" class="text-xl">👁️</span>
                  </button>
                </div>
                <!-- Password mismatch error -->
                <div *ngIf="registerForm.get('confirmPassword')?.touched && passwordMismatch" 
                     class="text-red-400 text-sm font-light mt-2">
                  Lozinke se ne poklapaju
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-4">
                <button
                  type="submit"
                  [disabled]="registerForm.invalid || passwordMismatch"
                  class="w-full glass-button glass-button-primary py-5 text-lg font-light tracking-wide group relative overflow-hidden"
                >
                  <span class="flex items-center justify-center space-x-3">
                    <span class="text-2xl group-hover:scale-110 transition-transform">🌟</span>
                    <span>Registruj Se</span>
                  </span>
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              <!-- Login Link -->
              <div class="text-center pt-6">
                <div class="cosmic-line-small mx-auto mb-6"></div>
                <p class="text-gray-400 font-light">
                  Već imate nalog?
                  <a routerLink="/auth/login" 
                     class="text-blue-400 hover:text-green-400 font-normal transition-colors duration-300 ml-2 tracking-wide">
                    Ulogujte se ovde
                  </a>
                </p>
              </div>
            </form>
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
    
    .glass-button:disabled {
      opacity: 0.5;
      transform: none;
      cursor: not-allowed;
    }
    
    .glass-button-primary {
      color: white;
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    }
    
    .glass-input {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(10px);
    }
    
    .cosmic-glow {
      filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
      animation: iconGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes iconGlow {
      from { filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5)); }
      to { filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.7)); }
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
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('iconPop', [
      transition(':enter', [
        style({ transform: 'scale(0.8)' }),
        animate('500ms 100ms ease', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  particles: Particle[] = [];
  mouseX: number = 0;
  mouseY: number = 0;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
  }

  get passwordMismatch() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password !== confirmPassword && confirmPassword !== '';
  }

  generateParticles() {
    const particleCount = 60;
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

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.valid && !this.passwordMismatch) {
      console.log('Register form submitted:', this.registerForm.value);
    }
  }
}