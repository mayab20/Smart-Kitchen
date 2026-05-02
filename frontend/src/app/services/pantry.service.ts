import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PantryService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private get headers() {
    return {
      headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` },
    };
  }

  searchItems(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/items/?search=${query}`,
      this.headers,
    );
  }

  getPantry(filters?: {
    category?: string;
    expires_before?: string;
    expires_after?: string;
  }): Observable<any[]> {
    let url = `${this.apiUrl}/pantries/pantry/`;
    const params: string[] = [];
    if (filters) {
      if (filters.category)
        params.push(`category=${encodeURIComponent(filters.category)}`);
      if (filters.expires_before)
        params.push(
          `expires_before=${encodeURIComponent(filters.expires_before)}`,
        );
      if (filters.expires_after)
        params.push(
          `expires_after=${encodeURIComponent(filters.expires_after)}`,
        );
    }
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<any[]>(url, this.headers);
  }

  addToPantry(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/pantries/pantry/`,
      data,
      this.headers,
    );
  }

  updatePantryItem(id: number, data: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/pantries/pantry/${id}/`,
      data,
      this.headers,
    );
  }

  updateQuantity(id: number, quantity: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/pantries/pantry/${id}/`,
      { quantity },
      this.headers,
    );
  }

  deleteFromPantry(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/pantries/pantry/${id}/`,
      this.headers,
    );
  }
}
