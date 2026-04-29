import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  category?: string;
  servings?: number;
  instructions?: string;
  image?: string | File | null;
  pdf_file?: string | File | null;
  recipe_ingredients?: Array<{ingredient: number; quantity: string}>;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private apiUrl = 'http://127.0.0.1:8000/api/recipes/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers() {
    const token = this.authService.getAccessToken();
    return token && token !== 'null' && token !== 'undefined'
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}my-recipes/`, this.headers);
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}${id}/`, this.headers);
  }

  addRecipe(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`, this.headers);
  }

  updateRecipe(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, data, this.headers);
  }

  cookRecipe(id: number, servings: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/cook/`, { servings }, this.headers);
  }

  getItems(): Observable<any[]> {
    return this.http.get<any[]>('http://127.0.0.1:8000/api/items/');
  }

  searchItems(query: string): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:8000/api/items/?search=${query}`);
  }
}
