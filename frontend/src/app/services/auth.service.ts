import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8000/api';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {
    // Load token from localStorage on service initialization
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      this.accessToken = storedToken;
    }
  }

  signup(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register/`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login/`, { username, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.accessToken = response.access;
        localStorage.setItem('accessToken', response.access);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/logout/`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken = null;
        localStorage.removeItem('accessToken');
      })
    );
  }

  isLoggedIn(): boolean {
    if (this.accessToken) {
      return true;
    }
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      this.accessToken = storedToken;
      return true;
    }
    return false;
  }

  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    const storedToken = localStorage.getItem('accessToken');
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      this.accessToken = storedToken;
      return storedToken;
    }

    return null;
  }

}
