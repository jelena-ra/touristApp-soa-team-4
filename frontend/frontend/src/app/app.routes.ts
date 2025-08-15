import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Profileform } from './profileform/profileform';
import { ProfileComponent } from './profile/profile';
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'create-profile', component: Profileform },
   { path: 'profile', component: ProfileComponent }

];
