// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http'; 
// import { TokenStorage } from '../auth/jwt/token.service'; 
// import { CommonModule } from '@angular/common';
// import { User } from '../auth/model/user.model';
// import { AuthService } from '../auth/auth.service';
// import { MaterialModule } from '../material/material.module';

// @Component({
//   selector: 'app-user-list',
//   standalone: true, 
//   templateUrl: './users-list.html',
//   styleUrls: ['./users-list.scss'], // <-- Promeni u .scss
//   imports: [
//     CommonModule,
//     MaterialModule 
//   ]
// })
// export class UsersList implements OnInit {
//   currentUser: User = { id: "", username: "", role: "", isBlocked: false };
//   users: any[] = []; 
//   selectedUser: User | null = null; // Može biti i null

//   constructor(private http: HttpClient, private authService: TokenStorage, private userService: AuthService) { }

//   ngOnInit(): void {
//     this.fetchUsers();
//     this.userService.user$.subscribe(user => { // Koristi user$
//       if (user) {
//         this.currentUser = user;
//         console.log('Trenutni korisnik:', this.currentUser);
//       }
//     });
//   }

//   onSelectUser(user: any): void {
//     this.selectedUser = user;
//   }

//   fetchUsers(): void {
//     const token = this.authService.getAccessToken();
//     if (!token) {
//       console.error('Nema tokena. Korisnik nije prijavljen.');
//       return;
//     }

//     const apiUrl = 'http://localhost:8000/api/users'; 

//     this.http.get<any[]>(apiUrl, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     }).subscribe({
//       next: (data) => {
//         this.users = data;
//         console.log('Korisnici uspešno dohvaćeni:', this.users);
//       },
//       error: (error) => console.error('Greška pri dohvatanju korisnika', error)
//     });
//   }

//   onBlockUser(user: User): void {
//     const token = this.authService.getAccessToken();
//     if (!token) {
//       console.error('Nema tokena. Korisnik nije prijavljen.');
//       return;
//     }

//     const apiUrl = `http://localhost:8000/api/users/${user.id}/block`;

//     this.http.put(apiUrl, {}, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     }).subscribe({
//       next: () => {
//         console.log(`Status korisnika ${user.username} je promenjen.`);
//         this.fetchUsers(); // Osveži listu da se prikaže promena
//       },
//       error: (error) => console.error('Greška pri blokiranju/odblokiranju korisnika', error)
//     });
//   }

//   // --- NOVE POMOĆNE METODE ---
//   getRoleIcon(role: string): string {
//     switch (role.toLowerCase()) {
//       case 'guide':
//       case 'vodic':
//         return '🧭';
//       case 'tourist':
//       case 'turista':
//         return '🎒';
//       case 'admin':
//       case 'administrator':
//         return '👑';
//       default:
//         return '👤';
//     }
//   }

//   getRoleText(role: string): string {
//     switch (role.toLowerCase()) {
//       case 'guide':
//       case 'vodic':
//         return 'Vodič';
//       case 'tourist':
//       case 'turista':
//         return 'Turista';
//       case 'admin':
//       case 'administrator':
//         return 'Admin';
//       default:
//         return 'Korisnik';
//     }
//   }
// }




import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { TokenStorage } from '../auth/jwt/token.service'; 
import { CommonModule } from '@angular/common';
import { User } from '../auth/model/user.model';
import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'app-user-list',
   standalone: true, 
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss'],
  imports: [
    CommonModule
  ]
})
export class UsersList implements OnInit {


  currentUser: User = {
    id: "",
    username: "",
    role: "",
    blocked: false
  };

  users: any[] = []; 
  selectedUser: User =  {
    id: "",
    username: "",
    role: "",
    blocked: false
};
  constructor(private http: HttpClient, private authService: TokenStorage, private userService: AuthService) { }

  ngOnInit(): void {
    this.fetchUsers();
    this.userService.getUser().subscribe(user => {
      this.currentUser = user;
      console.log('Trenutni korisnik:', this.currentUser);
    });
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
  onBlockUser(user: User): void {
  const token = this.authService.getAccessToken();
  if (!token) {
    console.error('Nema tokena. Korisnik nije prijavljen.');
    return;
  }

  const apiUrl = `http://localhost:8000/api/users/${user.id}/block`;

  this.http.put(apiUrl, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).subscribe({
    next: () => {
      console.log(`Korisnik ${user.username} je blokiran.`);
      
      this.fetchUsers();
    },
    error: (error) => {
      console.error('Greška pri blokiranju korisnika', error);
    }
  });
}

  getRoleIcon(role: string): string {
    if (!role) return '👤';
    switch (role.toLowerCase()) {
      case 'author':
      case 'vodic':
        return '🧭';
      case 'tourist':
      case 'turista':
        return '🎒';
      case 'administrator':
        return '👑';
      default:
        return '👤';
    }
  }

  getRoleText(role: string): string {
    if (!role) return 'Korisnik';
    switch (role.toLowerCase()) {
      case 'author':
      case 'vodic':
        return 'Vodič';
      case 'tourist':
      case 'turista':
        return 'Turista';
      case 'administrator':
        return 'Admin';
      default:
        return 'Korisnik';
    }
  }


}