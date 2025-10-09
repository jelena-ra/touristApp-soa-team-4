import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 class="text-3xl font-bold mb-4">Index Page</h1>
      <p class="text-muted-foreground">This is a placeholder for the Index/Simulator/Admin/Cart/Followers/Tours page.</p>
    </div>
  `,
  styles: []
})
export class IndexComponent {}
