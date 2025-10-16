import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Profileform } from './profileform/profileform';
import { ProfileComponent } from './profile/profile';
import { RegistrationComponent } from './auth/registration/registration.component';
import { LoginComponent } from './auth/login/login.component';
import { UsersList } from './users-list/users-list';
import { TouristLocationComponent } from './tour-execution/tourist-location/tourist-location';
import { ViewToursPage } from './tours/view-tours/view-tours.component';
import { TourDetailsPage } from './tours/tour-details/tour-detalis.component';
import { TourExecutionPageComponent } from './tours/tour-execution/tour-execution-page/tour-execution-page';
import { CartComponent } from './purchase/purchase/purchase';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'cart', component: CartComponent },
  { path: 'create-profile/:flag', component: Profileform },
  { path: 'profile', component: ProfileComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'usersList', component: UsersList },
  { path: 'login', component: LoginComponent },
  { path: 'tourist-location', component: TouristLocationComponent },
  { path: 'tours', component: ViewToursPage },
  { path: 'tours/:id', component: TourDetailsPage },
    { path: 'tour-execution/:id', component: TourExecutionPageComponent }
];
