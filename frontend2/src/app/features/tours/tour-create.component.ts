import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-tour-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
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
        <div class="max-w-6xl mx-auto px-6 py-12">
          
          <!-- Header Constellation -->
          <div class="text-center mb-16">
            <div [@starBurst] class="cosmic-glow mb-8">
              <span class="text-7xl">🗺️</span>
            </div>
            <h1 class="text-5xl md:text-6xl font-thin text-white mb-6 tracking-wide animate-glow">
              Kreirajte Novu Turu
            </h1>
            <div class="cosmic-line mx-auto mb-8"></div>
            <p class="text-xl text-gray-300 font-light max-w-2xl mx-auto">
              Dizajnirajte nezaboravno putovanje sa ključnim tačkama, rutama i doživljajima
            </p>
          </div>

          <!-- Form Constellation -->
          <div class="glass-constellation rounded-3xl p-12">
            <form [formGroup]="tourForm" (ngSubmit)="onSubmit()" class="space-y-10">
              
              <!-- Basic Tour Info Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <!-- Title Field -->
                <div class="cosmic-field">
                  <label for="title" class="cosmic-label">
                    <span class="field-icon">🌟</span>
                    Naziv Ture
                  </label>
                  <input
                    id="title"
                    type="text"
                    formControlName="title"
                    class="cosmic-input"
                    placeholder="Unesite naziv vaše ture..."
                  />
                  <div class="field-glow"></div>
                </div>

                <!-- Difficulty Level -->
                <div class="cosmic-field">
                  <label class="cosmic-label">
                    <span class="field-icon">⛰️</span>
                    Nivo Težine
                  </label>
                  <div class="grid grid-cols-3 gap-3 mt-4">
                    <label *ngFor="let difficulty of difficultyLevels" 
                           class="difficulty-star group cursor-pointer">
                      <input 
                        type="radio" 
                        [value]="difficulty.value" 
                        formControlName="difficulty"
                        class="hidden"
                      />
                      <div class="difficulty-card">
                        <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">{{ difficulty.icon }}</span>
                        <span class="text-sm font-light">{{ difficulty.name }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Description Field -->
              <div class="cosmic-field">
                <label for="description" class="cosmic-label">
                  <span class="field-icon">📝</span>
                  Opis Ture
                </label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="4"
                  class="cosmic-input"
                  placeholder="Opišite šta čini ovu turu posebnom..."
                ></textarea>
                <div class="field-glow"></div>
              </div>

              <!-- Duration and Length Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="cosmic-field">
                  <label for="walkingDuration" class="cosmic-label">
                    <span class="field-icon">🚶</span>
                    Vreme (pešice)
                  </label>
                  <input
                    id="walkingDuration"
                    type="text"
                    formControlName="walkingDuration"
                    class="cosmic-input"
                    placeholder="2h 30min"
                  />
                  <div class="field-glow"></div>
                </div>

                <div class="cosmic-field">
                  <label for="bikingDuration" class="cosmic-label">
                    <span class="field-icon">🚲</span>
                    Vreme (bicikl)
                  </label>
                  <input
                    id="bikingDuration"
                    type="text"
                    formControlName="bikingDuration"
                    class="cosmic-input"
                    placeholder="45min"
                  />
                  <div class="field-glow"></div>
                </div>

                <div class="cosmic-field">
                  <label for="length" class="cosmic-label">
                    <span class="field-icon">📏</span>
                    Dužina (km)
                  </label>
                  <input
                    id="length"
                    type="number"
                    formControlName="length"
                    class="cosmic-input"
                    placeholder="12.5"
                    step="0.1"
                  />
                  <div class="field-glow"></div>
                </div>
              </div>

              <!-- Tags Field -->
              <div class="cosmic-field">
                <label for="tags" class="cosmic-label">
                  <span class="field-icon">🏷️</span>
                  Tagovi
                </label>
                <input
                  id="tags"
                  type="text"
                  formControlName="tags"
                  class="cosmic-input"
                  placeholder="istorija, avantura, porodica, priroda"
                />
                <div class="field-glow"></div>
                <p class="text-gray-400 text-sm mt-2 font-light">
                  Dodajte tagove razdvojene zarezom
                </p>
              </div>

              <!-- Price Field -->
              <div class="cosmic-field">
                <label for="price" class="cosmic-label">
                  <span class="field-icon">💰</span>
                  Cena (0 za nacrt)
                </label>
                <input
                  id="price"
                  type="number"
                  formControlName="price"
                  class="cosmic-input"
                  placeholder="2500"
                  min="0"
                />
                <div class="field-glow"></div>
                <p class="text-gray-400 text-sm mt-2 font-light">
                  Cena u dinarima. Ostavite 0 za nacrt koji ćete kasnije objaviti.
                </p>
              </div>

              <!-- Cover Image Upload -->
              <div class="cosmic-field">
                <label for="coverImage" class="cosmic-label">
                  <span class="field-icon">🖼️</span>
                  Naslovnica Ture (Opciono)
                </label>
                <div class="image-upload-area">
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    (change)="onImageSelect($event)"
                    class="hidden"
                    #fileInput
                  />
                  <div (click)="fileInput.click()" 
                       class="upload-constellation cursor-pointer">
                    <div class="upload-icon">
                      <span class="text-4xl">📷</span>
                    </div>
                    <p class="text-gray-300 text-lg font-light">
                      Kliknite da dodate sliku
                    </p>
                    <p class="text-gray-500 text-sm">
                      JPG, PNG ili GIF (maks. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </form>

            <!-- Key Points Section (Outside Form) -->
            <div class="cosmic-field mt-10">
              <div class="flex items-center justify-between mb-6">
                <label class="cosmic-label">
                  <span class="field-icon">📍</span>
                  Ključne Tačke na Ruti
                </label>
                <button
                  type="button"
                  (click)="addKeyPoint()"
                  class="glass-button glass-button-secondary px-6 py-2 text-sm">
                  <span class="flex items-center space-x-2">
                    <span>➕</span>
                    <span>Dodaj Tačku</span>
                  </span>
                </button>
              </div>

              <div class="space-y-6">
                <div *ngFor="let point of keyPoints; let i = index" 
                     class="key-point-card">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-light text-white">Tačka {{ i + 1 }}</h3>
                    <button
                      type="button"
                      (click)="removeKeyPoint(i)"
                      class="text-red-400 hover:text-red-300 text-sm">
                      🗑️ Ukloni
                    </button>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        [(ngModel)]="point.name"
                        class="cosmic-input"
                        placeholder="Naziv tačke..."
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        [(ngModel)]="point.coordinates.lat"
                        class="cosmic-input"
                        placeholder="Lat"
                        step="0.000001"
                      />
                      <input
                        type="number"
                        [(ngModel)]="point.coordinates.lng"
                        class="cosmic-input"
                        placeholder="Lng"
                        step="0.000001"
                      />
                    </div>
                  </div>
                  
                  <textarea
                    [(ngModel)]="point.description"
                    rows="2"
                    class="cosmic-input mt-4"
                    placeholder="Opis tačke..."
                  ></textarea>
                </div>
              </div>
            </div>

            <form [formGroup]="tourForm" (ngSubmit)="onSubmit()" class="space-y-10 mt-10">
              <!-- Status Selection -->
              <div class="cosmic-field">
                <label class="cosmic-label">
                  <span class="field-icon">🔮</span>
                  Status Ture
                </label>
                <div class="grid grid-cols-3 gap-4 mt-4">
                  <label *ngFor="let status of statusOptions" 
                         class="status-star group cursor-pointer">
                    <input 
                      type="radio" 
                      [value]="status.value" 
                      formControlName="status"
                      class="hidden"
                    />
                    <div class="status-card" [ngClass]="status.class">
                      <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">{{ status.icon }}</span>
                      <span class="text-sm font-light">{{ status.name }}</span>
                      <p class="text-xs opacity-70 mt-1">{{ status.description }}</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button
                  type="button"
                  (click)="saveDraft()"
                  class="glass-button glass-button-secondary px-10 py-4 text-lg font-light tracking-wide group">
                  <span class="flex items-center space-x-3">
                    <span class="text-2xl group-hover:scale-110 transition-transform">💾</span>
                    <span>Sačuvaj Nacrt</span>
                  </span>
                </button>
                
                <button
                  type="submit"
                  [disabled]="tourForm.invalid"
                  class="glass-button glass-button-primary px-10 py-4 text-lg font-light tracking-wide group">
                  <span class="flex items-center space-x-3">
                    <span class="text-2xl group-hover:scale-110 transition-transform">🚀</span>
                    <span>Kreiraj Turu</span>
                  </span>
                </button>
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
    

    
    .glass-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      box-shadow: 
        0 0 40px rgba(96, 165, 250, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .cosmic-field {
      position: relative;
    }
    
    .cosmic-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.1rem;
      font-weight: 300;
      color: white;
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
    
    .field-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
    }
    
    .cosmic-input {
      width: 100%;
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 1rem;
      padding: 1rem 1.5rem;
      color: white;
      font-size: 1rem;
      font-weight: 300;
      transition: all 0.3s ease;
      resize: vertical;
    }
    
    .cosmic-input::placeholder {
      color: rgba(156, 163, 175, 0.7);
    }
    
    .cosmic-input:focus {
      outline: none;
      border-color: rgba(96, 165, 250, 0.6);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    }
    
    .field-glow {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .cosmic-field:focus-within .field-glow {
      opacity: 1;
      animation: lineGlow 2s ease-in-out infinite alternate;
    }
    
    .difficulty-star, .status-star {
      position: relative;
    }
    
    .difficulty-card, .status-card {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1rem;
      padding: 1.5rem;
      text-align: center;
      color: white;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .difficulty-star input:checked + .difficulty-card,
    .status-star input:checked + .status-card {
      border-color: rgba(96, 165, 250, 0.6);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
      background: rgba(96, 165, 250, 0.1);
    }
    
    .difficulty-card:hover, .status-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(96, 165, 250, 0.2);
    }
    
    .status-card.draft {
      border-color: rgba(156, 163, 175, 0.3);
    }
    
    .status-card.published {
      border-color: rgba(34, 197, 94, 0.3);
    }
    
    .status-card.archived {
      border-color: rgba(239, 68, 68, 0.3);
    }
    
    .key-point-card {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .upload-constellation {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(10px);
      border: 2px dashed rgba(148, 163, 184, 0.3);
      border-radius: 1rem;
      padding: 3rem 2rem;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .upload-constellation:hover {
      border-color: rgba(96, 165, 250, 0.5);
      background: rgba(96, 165, 250, 0.05);
    }
    
    .upload-icon {
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
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
    
    .glass-button-secondary {
      color: rgba(255, 255, 255, 0.8);
      border-color: rgba(148, 163, 184, 0.3);
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
    ])
  ]
})
export class TourCreateComponent implements OnInit {
  tourForm: FormGroup;
  particles: Particle[] = [];

  mouseX: number = 0;
  mouseY: number = 0;
  keyPoints: KeyPoint[] = [];

  difficultyLevels = [
    { value: 'easy', name: 'Lako', icon: '🌱' },
    { value: 'medium', name: 'Srednje', icon: '⛰️' },
    { value: 'hard', name: 'Teško', icon: '🏔️' }
  ];

  statusOptions = [
    { 
      value: 'draft', 
      name: 'Nacrt', 
      icon: '📝', 
      description: 'Radi se na turi',
      class: 'draft'
    },
    { 
      value: 'published', 
      name: 'Objavljeno', 
      icon: '🌟', 
      description: 'Dostupno korisnicima',
      class: 'published'
    },
    { 
      value: 'archived', 
      name: 'Arhivirano', 
      icon: '📦', 
      description: 'Neaktivno',
      class: 'archived'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.tourForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['', Validators.required],
      walkingDuration: [''],
      bikingDuration: [''],
      length: ['', [Validators.required, Validators.min(0.1)]],
      tags: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['draft', Validators.required]
    });
  }

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
    this.addKeyPoint(); // Start with one key point
  }

  generateParticles() {
    const particleCount = 120;
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
      
      if (distance < 150) {
        const force = (150 - distance) / 150;
        particle.targetX = particle.x - (dx / distance) * force * 50;
        particle.targetY = particle.y - (dy / distance) * force * 50;
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

  addKeyPoint() {
    this.keyPoints.push({
      id: Date.now().toString(),
      name: '',
      description: '',
      coordinates: { lat: 0, lng: 0 }
    });
  }

  removeKeyPoint(index: number) {
    this.keyPoints.splice(index, 1);
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected image:', file.name);
      // Handle image upload logic here
    }
  }

  saveDraft() {
    const tourData = {
      ...this.tourForm.value,
      keyPoints: this.keyPoints,
      status: 'draft'
    };
    console.log('Saving tour draft...', tourData);
    // Handle save draft logic
  }

  onSubmit() {
    if (this.tourForm.valid) {
      const tourData = {
        ...this.tourForm.value,
        keyPoints: this.keyPoints
      };
      console.log('Creating tour...', tourData);
      // Handle form submission logic
    }
  }
}