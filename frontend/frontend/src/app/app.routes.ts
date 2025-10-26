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
import { BlogFormComponent } from './blogs/blog-form/blog-form.component';
import { FeedComponent } from './blogs/feed/feed';
import { RecommendationsComponent } from './following/pages/recommendations/recommendations';
import { UserListComponent } from './following/pages/user-list/user-list';
import { BlogDetailComponent } from './blogs/blog-detail/blog-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'create-profile', component: Profileform },
  { path: 'profile', component: ProfileComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'usersList', component: UsersList },
  { path: 'login', component: LoginComponent },
  { path: 'tourist-location', component: TouristLocationComponent },
  { path: 'tours', component: ViewToursPage },
  { path: 'tours/:id', component: TourDetailsPage },
  { path: 'tour-execution/:id', component: TourExecutionPageComponent },
  { path: 'blogs/create', component: BlogFormComponent }
  ,{ path: 'blogs/feed', component: FeedComponent }
  ,{ path: 'blogs/:id', component: BlogDetailComponent }
  ,{ path: 'following/recommendations', component: RecommendationsComponent }
  ,{ path: 'following/users', component: UserListComponent }
];
