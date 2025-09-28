import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
}

@Component({
  selector: 'app-particle-system',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas
      *ngIf="isBrowser"
      #canvas
      class="fixed inset-0 pointer-events-none z-0"
      [ngStyle]="{ 'mix-blend-mode': 'screen' }"
    ></canvas>
  `,
  styles: []
})
export class ParticleSystemComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef?: ElementRef<HTMLCanvasElement>;
  
  private particles: Particle[] = [];
  private animationId?: number;
  private ctx?: CanvasRenderingContext2D;

  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser && this.canvasRef && this.canvasRef.nativeElement) {
      this.initializeParticleSystem();
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.updateCanvasSize);
    }
  }

  private initializeParticleSystem(): void {
    if (!this.isBrowser || !this.canvasRef || !this.canvasRef.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.updateCanvasSize();
    window.addEventListener('resize', this.updateCanvasSize.bind(this));

    // Create initial particles
    for (let i = 0; i < 50; i++) {
      this.particles.push(this.createParticle());
    }

    this.animate();
  }

  private updateCanvasSize = (): void => {
    if (!this.isBrowser || !this.canvasRef || !this.canvasRef.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  private createParticle(): Particle {
    const width = this.canvasRef && this.canvasRef.nativeElement ? this.canvasRef.nativeElement.width : 0;
    const height = this.canvasRef && this.canvasRef.nativeElement ? this.canvasRef.nativeElement.height : 0;
    return {
      id: Math.random(),
      x: Math.random() * width,
      y: height + 10,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: -(Math.random() * 3 + 2),
      opacity: Math.random() * 0.8 + 0.2,
      life: 1,
    };
  }

  private animate = (): void => {
    if (!this.isBrowser || !this.ctx || !this.canvasRef || !this.canvasRef.nativeElement) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Update life
      particle.life -= 0.01;

      // Remove dead particles
      if (particle.life <= 0 || particle.y < -10) {
        this.particles[index] = this.createParticle();
      }

      // Draw particle
      this.ctx!.save();
      this.ctx!.globalAlpha = particle.opacity * particle.life;
      this.ctx!.fillStyle = '#ffffff';
      this.ctx!.beginPath();
      this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx!.fill();
      this.ctx!.restore();
    });

    // Occasionally add new particles
    if (Math.random() < 0.3 && this.particles.length < 80) {
      this.particles.push(this.createParticle());
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}