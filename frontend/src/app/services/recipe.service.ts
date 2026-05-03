import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  recipe_ingredients?: Array<{
    ingredient: number;
    quantity: string;
    unit?: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private apiUrl = 'http://127.0.0.1:8000/api/recipes/';
  private itemsUrl = 'http://127.0.0.1:8000/api/items/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private get authOptions() {
    const token = this.authService.getAccessToken();

    return token && token !== 'null' && token !== 'undefined'
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(
      `${this.apiUrl}my-recipes/`,
      this.authOptions
    );
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}${id}/`);
  }

  addRecipe(data: FormData): Observable<Recipe> {
    return this.http.post<Recipe>(
      this.apiUrl,
      data,
      this.authOptions
    );
  }

  updateRecipe(id: number, data: FormData): Observable<Recipe> {
    return this.http.put<Recipe>(
      `${this.apiUrl}${id}/`,
      data,
      this.authOptions
    );
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}${id}/`,
      this.authOptions
    );
  }

  cookRecipe(id: number, servings: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${id}/cook/`,
      { servings },
      this.authOptions
    );
  }

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.itemsUrl);
  }

  searchItems(query: string): Observable<any[]> {
    const params = new HttpParams().set('search', query || '');

    return this.http.get<any[]>(this.itemsUrl, {
      params,
    });
  }

  searchRecipesByTitle(query: string): Observable<Recipe[]> {
  const params = new HttpParams().set('search', query || '');

  return this.http.get<Recipe[]>(this.apiUrl, {
    params,
  });
}
}