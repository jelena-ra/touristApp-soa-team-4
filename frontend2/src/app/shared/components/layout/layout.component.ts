import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ParticleSystemComponent } from './particle-system.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ParticleSystemComponent, NavbarComponent],
  template: `
    <div class="min-h-screen bg-background relative overflow-x-hidden">
      <!-- Particle System Background -->
      <app-particle-system></app-particle-system>

      <!-- Subtle dot pattern overlay -->
      <div class="fixed inset-0 -z-10 pointer-events-none">
        <div 
          class="absolute inset-0 opacity-10"
          [ngStyle]="{
            'background-image': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            'background-size': '20px 20px'
          }"
        ></div>
      </div>

      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Animated main content area -->
      <main class="relative z-10 flex flex-col flex-1" [@fadeIn]>
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [],
  animations: [
    // Simple fade-in animation for main content
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LayoutComponent {
}