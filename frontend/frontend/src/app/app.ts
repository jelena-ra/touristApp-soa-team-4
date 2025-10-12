import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TourExecutionModule } from './tour-execution/tour-execution.module';
import { NavbarComponent } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TourExecutionModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
