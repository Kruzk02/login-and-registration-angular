import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { LoginDTO } from '../dtos/LoginDTO';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { UserResponse } from "../dtos/UserResponse";
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn = this.loggedInSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(this.getStoredUsername());
  public username = this.usernameSubject.asObservable();

  constructor(private httpClient: HttpClient, private router: Router) {}

  register(registerDTO: RegisterDTO): Observable<boolean> {
    return this.httpClient.post<{ token: string }>(`${this.apiUrl}/api/register`, registerDTO)
      .pipe(
        map(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error("Error in register:", error);
          return of(false);
        })
      );
  }

  login(loginDTO: LoginDTO): Observable<boolean> {
    return this.httpClient.post<{ token: string }>(`${this.apiUrl}/api/login`, loginDTO)
      .pipe(
        map(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error("Error in login:", error);
          return of(false);
        })
      );
  }

  update(formData: FormData): Observable<boolean> {
    return this.httpClient.post<{ userResponse: UserResponse }>(`${this.apiUrl}/api/update-user`, formData)
      .pipe(
        map(response => {
          if (response?.userResponse?.username) {
            this.storeUsername(response.userResponse.username);
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error("Error in update:", error);
          return of(false);
        })
      );
  }

  verify(token: string | null): Observable<{ status: string; message: string }> {
    const headers = this.getAuthHeaders();
    return this.httpClient.get<{ message: string }>(`${this.apiUrl}/api/verify?token=${token}`, { headers })
      .pipe(
        map(response => ({ status: 'success', message: response.message })),
        catchError(error => {
          console.error("Error in verify:", error);
          return of({ status: 'error', message: 'Verification failed.' });
        })
      );
  }

  getUsername(): Observable<string> {
    return this.httpClient.get<{ username: string }>(`${this.apiUrl}/api/get-username`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.username),
        catchError(error => {
          console.error("Error fetching username:", error);
          return of('');
        })
      );
  }

  getFullUserDetails(): Observable<UserResponse | null> {
    return this.httpClient.get<{ userResponse: UserResponse }>(`${this.apiUrl}/api/user-details`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.userResponse),
        catchError(error => {
          console.error("Error fetching user details:", error);
          return of(null);
        })
      );
  }

  getUserProfilePicture(): Observable<Blob> {
    return this.httpClient.get(`${this.apiUrl}/api/profile-picture`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
    });
  }

  logout(): void {
    sessionStorage.clear();
    this.loggedInSubject.next(false);
    this.usernameSubject.next(null);
    this.router.navigate(['/login']);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getJwtToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
  }

  private getJwtToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private getStoredUsername(): string | null {
    return sessionStorage.getItem('username');
  }

  private storeUsername(username: string): void {
    sessionStorage.setItem('username', username);
    this.usernameSubject.next(username);
  }

  private handleAuthResponse(response: { token: string }): boolean {
    if (response?.token) {
      sessionStorage.setItem('token', response.token);
      this.loggedInSubject.next(true);
      this.getUsername().subscribe(username => this.storeUsername(username));
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return !!this.getJwtToken();
  }
}

