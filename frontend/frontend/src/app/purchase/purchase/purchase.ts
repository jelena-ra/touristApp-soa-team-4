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

  constructor(
    private authService: AuthService,
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.getUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.loadCart();
      } else {
        this.snackBar.open('You must be logged in to view your cart.', 'Close', { duration: 3000 });
      }
    });
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
          this.snackBar.open('Failed to load cart. ' + err.error.error, 'Close', { duration: 3000 });
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
          this.snackBar.open('Item removed from cart!', 'Close', { duration: 3000 });
          this.loadCart();
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.snackBar.open('Failed to remove item. ' + err.error.error, 'Close', { duration: 3000 });
        }
      });
  }

  clearCart(): void {
  
    if (!this.userId || this.cartItems.length === 0) {
      this.snackBar.open('Cart is already empty.', 'Close', { duration: 3000 });
      return;
    }
    const removePromises = this.cartItems.map(item =>
      this.purchaseService.removeItem(this.userId, item.tour_id).toPromise()
    );

    Promise.all(removePromises)
      .then(() => {
        this.snackBar.open('Cart cleared successfully!', 'Close', { duration: 3000 });
        this.loadCart();
      })
      .catch(err => {
        console.error('Error clearing cart:', err);
        this.snackBar.open('Failed to clear cart. Some items might not be removed.', 'Close', { duration: 3000 });
        this.loadCart(); 
      });
  }


  checkout(): void {
    if (!this.userId || this.cartItems.length === 0) {
      this.snackBar.open('Your cart is empty. Nothing to checkout.', 'Close', { duration: 3000 });
      return;
    }

    this.purchaseService.checkout(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Checkout successful:', response);
          this.snackBar.open('Checkout successful! You have purchased the tours.', 'Close', { duration: 5000 });
          this.loadCart(); 
        },
        error: (err) => {
          console.error('Error during checkout:', err);
          this.snackBar.open('Checkout failed. ' + err.error.error, 'Close', { duration: 3000 });
        }
      });
  }
}