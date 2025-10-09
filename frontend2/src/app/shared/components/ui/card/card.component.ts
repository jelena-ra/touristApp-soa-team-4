import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../utils/cn.util';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() class = '';

  get cardClasses(): string {
    const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm';
    return cn(baseClasses, this.class);
  }
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="headerClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardHeaderComponent {
  @Input() class = '';

  get headerClasses(): string {
    const baseClasses = 'flex flex-col space-y-1.5 p-6';
    return cn(baseClasses, this.class);
  }
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 [class]="titleClasses">
      <ng-content></ng-content>
    </h3>
  `,
  styles: []
})
export class CardTitleComponent {
  @Input() class = '';

  get titleClasses(): string {
    const baseClasses = 'text-2xl font-semibold leading-none tracking-tight';
    return cn(baseClasses, this.class);
  }
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p [class]="descriptionClasses">
      <ng-content></ng-content>
    </p>
  `,
  styles: []
})
export class CardDescriptionComponent {
  @Input() class = '';

  get descriptionClasses(): string {
    const baseClasses = 'text-sm text-muted-foreground';
    return cn(baseClasses, this.class);
  }
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="contentClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardContentComponent {
  @Input() class = '';

  get contentClasses(): string {
    const baseClasses = 'p-6 pt-0';
    return cn(baseClasses, this.class);
  }
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="footerClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardFooterComponent {
  @Input() class = '';

  get footerClasses(): string {
    const baseClasses = 'flex items-center p-6 pt-0';
    return cn(baseClasses, this.class);
  }
}