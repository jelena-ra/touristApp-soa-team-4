import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/auth.service'; 
import { PurchaseService } from '../service/purchase.service';
import { OrderItem } from '../model/order-item.interface'; 
import { Cart } from '../model/cart.interface'; 
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TokenStorage } from '../../auth/jwt/token.service';
import { ProfileService } from '../../profileform/profile.service';

@Component({
  standalone: true,
  selector: 'xp-cart',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './purchase.html',
  styleUrls: ['./purchase.css'] 
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: OrderItem[] = [];
  totalPrice: number = 0;
  userId: string = '';
  userMoney: number= 0;
  private destroyRef = inject(DestroyRef);
  token:string | null =null;

  constructor(
    private authService: AuthService,
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar,
    private tokenStorage : TokenStorage,
    private profileService : ProfileService
  ) {}

  ngOnInit(): void {
     this.token = this.tokenStorage.getAccessToken();
    this.authService.getUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.loadProfile();
        this.loadCart();
      } else {
        this.snackBar.open('Morate biti ulogovani da biste videli korpu.', 'Close', { duration: 3000 });
      }
    });
  }
loadProfile(): void {
   this.profileService.getProfileByUserId(this.userId).subscribe(profile=>{
          this.userMoney = profile.money;
        })
}
  loadCart(): void {
    if (!this.userId) return;

    this.purchaseService.viewCart(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.cart = response.cart;
          this.cartItems = response.items || [];
          //this.totalPrice = response.total;
          this.calculateTotalPrice();
          console.log('Cart loaded:', this.cart, this.cartItems);
        },
        error: (err) => {
          console.error('Error loading cart:', err);
          this.snackBar.open('Nije moguce ucitati korpu. ' + err.error.error, 'Close', { duration: 3000 });
        }
      });
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  removeItem(tourId: string): void {
    if (!this.userId) return;

    this.purchaseService.removeItem(this.userId, tourId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Uklonjena stavka iz korpe!', 'Close', { duration: 3000 });
          this.loadCart();
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.snackBar.open('Nije moguce ukloniti stavku. ' + err.error.error, 'Close', { duration: 3000 });
        }
      });
  }

  clearCart(): void {
  
    if (!this.userId || this.cartItems.length === 0) {
      this.snackBar.open('Korpa je prazna.', 'Close', { duration: 3000 });
      return;
    }
    const removePromises = this.cartItems.map(item =>
      this.purchaseService.removeItem(this.userId, item.tour_id).toPromise()
    );

    Promise.all(removePromises)
      .then(() => {
        this.snackBar.open('Uspesno ispraznjena korpa!', 'Close', { duration: 3000 });
        this.loadCart();
      })
      .catch(err => {
        console.error('Error clearing cart:', err);
        this.snackBar.open('Nije moguce isprazniti korpu', 'Close', { duration: 3000 });
        this.loadCart(); 
      });
  }


  checkout(): void {
    if (!this.userId || this.cartItems.length === 0) {
      this.snackBar.open('Vasa korpa je prazna. Nema stavki za kupovinu', 'Close', { duration: 3000 });
      return;
    }

    this.purchaseService.checkout(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Checkout successful:', response);
          this.loadProfile();
          this.snackBar.open('Usesno kupljene ture!', 'Close', { duration: 5000 });
          this.loadCart(); 
        },
        error: (err) => {
          console.error('Error during checkout:', err);
          this.snackBar.open('Neuspesna kupovina! ' + err.error.error, 'Close', { duration: 3000 });
        }
      });
  }
}