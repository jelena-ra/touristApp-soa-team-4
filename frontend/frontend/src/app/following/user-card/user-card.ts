import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../auth/model/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.css']
})
export class UserCardComponent {
  @Input() user!: User; 
  @Input() isFollowing: boolean = false;

  @Output() follow = new EventEmitter<string>();
  @Output() unfollow = new EventEmitter<string>();

  onFollowClick(): void {
    this.follow.emit(this.user.id);
  }
}