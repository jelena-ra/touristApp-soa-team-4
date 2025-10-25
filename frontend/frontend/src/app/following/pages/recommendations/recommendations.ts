import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../auth/model/user.model';
import { AuthService } from '../../../auth/auth.service';
import { FollowingService, FollowPayload } from '../../following';
import { UserCardComponent } from '../../user-card/user-card';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, UserCardComponent], // Dodajte UserCardComponent
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.css']
})
export class RecommendationsComponent implements OnInit {
  recommendations: User[] = [];
  currentUserId: string | null = null;
  
  constructor(
    private authService: AuthService,
    private followingService: FollowingService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.currentUserId) {
      this.followingService.getRecommendations(this.currentUserId).subscribe(users => {
        this.recommendations = users;
      });
    }
  }

  // Metoda koja se poziva kada stigne `follow` događaj iz kartice
  onFollow(userIdToFollow: string): void {
    if (!this.currentUserId) return;

    const payload: FollowPayload = {
      followerId: this.currentUserId,
      followedId: userIdToFollow
    };

    this.followingService.followUser(payload).subscribe(() => {
      // Optimistic update: uklonimo korisnika iz liste preporuka
      // jer ga sada pratimo. Ovo je dobar UX.
      this.recommendations = this.recommendations.filter(user => user.id !== userIdToFollow);
      alert('Korisnik uspešno zapraćen!');
    });
  }

  // Metodu za unfollow nećemo implementirati ovde, jer preporuke
  // obično ne prikazuju ljude koje već pratimo.
}