import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Cart } from "../model/cart.interface";
import { OrderItem } from "../model/order-item.interface";
import { TokenStorage } from "../../auth/jwt/token.service";

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private baseUrl = 'http://localhost:8000/api/cart';


  constructor(private http: HttpClient, private tokenStorage: TokenStorage) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenStorage.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


 addToCart(payload: { user_id: string, item: any }): Observable<any> {
    return this.http.post('http://localhost:8000/api/cart/add', payload,  { headers: this.getAuthHeaders() });
}

   removeItem(userId: string, tourId: string): Observable<{ status: string }> { 
    return this.http.post<{ status: string }>(`${this.baseUrl}/remove`, { user_id: userId, tour_id: tourId },  { headers: this.getAuthHeaders() });
  }

  
    viewCart(userId: string): Observable<CartResponse> { 
    return this.http.get<CartResponse>(`${this.baseUrl}/view?user_id=${userId}`,  { headers: this.getAuthHeaders() }); 
    }


  checkout(userId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/checkout`, { user_id: userId },  { headers: this.getAuthHeaders() });
  }
}
export interface CartResponse {
  cart: Cart | null; 
  items: OrderItem[];
  total: number;
}