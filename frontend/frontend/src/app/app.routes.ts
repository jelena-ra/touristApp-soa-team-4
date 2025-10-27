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
import { KeyPointsMapPageComponent } from './tours/key-points-map/tours/key-points-map-page/key-points-map-page';
import { roleGuard } from './guards/role-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'cart', component: CartComponent, canActivate: [authGuard, roleGuard(['tourist'])] },
  { path: 'create-profile/:flag', component: Profileform },
  { path: 'profile', component: ProfileComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'usersList', component: UsersList, canActivate: [authGuard, roleGuard(['administrator'])] },
  { path: 'login', component: LoginComponent },
  { path: 'tourist-location', component: TouristLocationComponent },
  { path: 'tours', component: ViewToursPage },
  { path: 'tours/:id', component: TourDetailsPage },
  { path: 'tour-execution/:id', component: TourExecutionPageComponent, canActivate: [authGuard, roleGuard(['tourist'])] },
  { path: 'tours/:id/map-editor', component: KeyPointsMapPageComponent }
];
