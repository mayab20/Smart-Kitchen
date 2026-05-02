import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'access_token';
  private _isLoggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem(this.storageKey));
  readonly isLoggedIn$ = this._isLoggedIn.asObservable();

  private apiUrl = 'http://localhost:8000/api';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {
    // Load token from localStorage on service initialization
    const storedToken = localStorage.getItem(this.storageKey);
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      this.accessToken = storedToken;
      this._isLoggedIn.next(true);
    } else {
      this._isLoggedIn.next(false);
    }

    // Keep login state in sync across tabs
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === this.storageKey) {
        const val = e.newValue;
        const logged = !!val && val !== 'null' && val !== 'undefined';
        this.accessToken = logged ? val : null;
        this._isLoggedIn.next(logged);
      }
    });
  }

  signup(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register/`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login/`, { username, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.accessToken = response.access;
        localStorage.setItem(this.storageKey, response.access);
        this._isLoggedIn.next(true);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/logout/`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken = null;
        localStorage.removeItem(this.storageKey);
        this._isLoggedIn.next(false);
      })
    );
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }

  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    const storedToken = localStorage.getItem(this.storageKey);
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      this.accessToken = storedToken;
      return storedToken;
    }

    return null;
  }

}
