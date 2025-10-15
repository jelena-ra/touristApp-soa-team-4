import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Cart } from "../model/cart.interface";
import { OrderItem } from "../model/order-item.interface";

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private baseUrl = 'http://localhost:8000/api/cart';

  constructor(private http: HttpClient) {}


 addToCart(payload: { user_id: string, item: any }): Observable<any> {
    return this.http.post('http://localhost:8000/api/cart/add', payload);
}

   removeItem(userId: string, tourId: string): Observable<{ status: string }> { 
    return this.http.post<{ status: string }>(`${this.baseUrl}/remove`, { user_id: userId, tour_id: tourId });
  }

  
    viewCart(userId: string): Observable<CartResponse> { 
    return this.http.get<CartResponse>(`${this.baseUrl}/view?user_id=${userId}`); 
    }


  checkout(userId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/checkout`, { user_id: userId });
  }
}
export interface CartResponse {
  cart: Cart | null; 
  items: OrderItem[];
  total: number;
}