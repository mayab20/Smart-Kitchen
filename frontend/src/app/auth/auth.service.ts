import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8000/api';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  signup(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { username, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.accessToken = response.access;
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout/`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken = null;
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

}
