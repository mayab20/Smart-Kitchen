import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Recipe {
  id?: number;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private apiUrl = 'http://127.0.0.1:8000/api/recipes/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers() {
    return {
      headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` },
    };
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}my-recipes/`, this.headers);
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  addRecipe(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.headers);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`, this.headers);
  }

  updateRecipe(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, data, this.headers);
  }

  getItems(): Observable<any[]> {
    return this.http.get<any[]>('http://127.0.0.1:8000/api/items/');
  }

  searchItems(query: string): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:8000/api/items/?search=${query}`);
  }
}
