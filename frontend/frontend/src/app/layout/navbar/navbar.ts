import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../material/material.module';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClientModule } from '@angular/common/http';
import { MatMenu } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, MatDividerModule, HttpClientModule, MatMenu, MatMenuTrigger],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  user$: Observable<User>;

  constructor(
    public authService: AuthService, 
    private router: Router
  ) {
    // Inicijalizujemo user$ observable
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    // Proveravamo da li postoji token pri učitavanju aplikacije
    // (Ova logika je često u app.component.ts, ali može i ovde)
    // this.authService.checkIfUserExists(); 
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(username: string): string {
    if (!username) return '';
    const names = username.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }
}