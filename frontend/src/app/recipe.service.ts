import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recipe {
  id?: number;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private apiUrl = 'http://127.0.0.1:8000/api/recipes/';

  constructor(private http: HttpClient) {}

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  addRecipe(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  updateRecipe(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, data);
  }

  getItems(): Observable<any[]> {
  return this.http.get<any[]>('http://127.0.0.1:8000/api/items/');
}
}