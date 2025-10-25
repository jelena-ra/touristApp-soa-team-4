import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { User } from '../../../auth/model/user.model';
import { AuthService } from '../../../auth/auth.service';
import { FollowingService, FollowPayload } from '../../following';
import { UserCardComponent } from '../../user-card/user-card';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  followingIds: Set<string> = new Set();
  currentUserId: string | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private followingService: FollowingService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    // --- LOG 1: Provera ID-ja ulogovanog korisnika ---
    console.log('[DEBUG] Trenutno ulogovani korisnik ID:', this.currentUserId);

    if (!this.currentUserId) {
      this.isLoading = false;
      return;
    }

    forkJoin({
      allUsers: this.followingService.getAllUsers(),
      followedUsersResponse: this.followingService.getFollowings(this.currentUserId)
    }).subscribe(({ allUsers, followedUsersResponse }) => {
      
      // --- LOG 2: Provera liste ID-jeva koje korisnik prati ---
      console.log('[DEBUG] Korisnik prati sledeće ID-jeve (primljeno od API-ja):', followedUsersResponse.ids);
      
      this.followingIds = new Set(followedUsersResponse.ids);
      
      this.users = allUsers.filter(u => u.id !== this.currentUserId);
      this.isLoading = false;
    });
  }

  onFollow(userIdToFollow: string): void {
    if (!this.currentUserId) return;

    const payload: FollowPayload = { followerId: this.currentUserId, followedId: userIdToFollow };
    this.followingService.followUser(payload).subscribe(() => {
      this.followingIds.add(userIdToFollow);
      
      // Možete dodati i log ovde da potvrdite da se stanje ažuriralo
      console.log('[DEBUG] Lokalno stanje "followingIds" posle praćenja:', this.followingIds);
    });
  }
}