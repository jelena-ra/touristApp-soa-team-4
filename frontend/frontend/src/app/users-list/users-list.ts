import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { TokenStorage } from '../auth/jwt/token.service'; 
import { CommonModule } from '@angular/common';
import { User } from '../auth/model/user.model';
@Component({
  selector: 'app-user-list',
   standalone: true, 
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
  imports: [
    CommonModule
  ]
})
export class UsersList implements OnInit {

  users: any[] = []; 
  selectedUser: User =  {
    id: "",
    username: "",
    role: ""
};
  constructor(private http: HttpClient, private authService: TokenStorage) { }

  ngOnInit(): void {
    this.fetchUsers();
  }
  onSelectUser(user: any): void {
    this.selectedUser = user;
  }
  fetchUsers(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('Nema tokena. Korisnik nije prijavljen.');
      return;
    }

    const apiUrl = 'http://localhost:8000/api/users'; 

    this.http.get<any[]>(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.users = data;
        console.log('Korisnici uspešno dohvaćeni:', this.users);
      },
      error: (error) => {
        console.error('Greška pri dohvatanju korisnika', error);
      }
    });
  }
}