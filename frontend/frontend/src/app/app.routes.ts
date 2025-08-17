import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Profileform } from './profileform/profileform';
import { ProfileComponent } from './profile/profile';
import { RegistrationComponent } from './auth/registration/registration.component';
import { LoginComponent } from './auth/login/login.component';
import { UsersList } from './users-list/users-list';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'create-profile', component: Profileform },
  { path: 'profile', component: ProfileComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'usersList', component: UsersList }

];
