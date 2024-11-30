import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginDTO } from '../dtos/LoginDTO';
import { environment } from '../../environments/environment.development';
import { Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public loggedIn = this.loggedInSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(null);
  public username = this.usernameSubject.asObservable();
  
  constructor(private httpClient: HttpClient, private router: Router) { }

  register(registerDTO: RegisterDTO):Observable<{status: string, message: string}> {
    return this.httpClient.post<{message: string}>(`${this.apiUrl}/api/register`, registerDTO, {responseType: 'json'})
    .pipe(
      map(response => {
        return { status: 'Success', message: response.message }
      }),
      catchError(() => {
        return of({ status: 'error', message: 'Username or email already taken' });
      })
    );
  }

  login(loginDTO: LoginDTO):Observable<boolean> {
    return this.httpClient.post<{token: string}>(`${this.apiUrl}/api/login`, loginDTO)
      .pipe(map(response => {
        if (response.token != null) {
          sessionStorage.setItem("token", response.token);
          this.loggedInSubject.next(true)

          this.getUsername().subscribe(username => {
            sessionStorage.setItem("username",username)
            this.usernameSubject.next(username)
          });
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.loggedInSubject.next(false);
        return of(false);
      }))
  }

  verify(token: string): Observable<{status: string, message: string}> {
    const jwtToken = this.getJwtToken();
  
    if (!jwtToken) {
      throw new Error("Jwt token shouldn't be empty");
    }
  
    const headers = new HttpHeaders().set("Authorization", `Bearer ${jwtToken}`);
    return this.httpClient.get<{message: string}>(`${this.apiUrl}/api/verify?token=${token}`, { headers })
      .pipe(
        map(response => {
          setInterval(() => this.router.navigateByUrl("/"))
          return { status: 'success', message: response.message };
        }),
        catchError(err => {
          console.error('Verification error:', err);
          return of({ status: 'error', message: 'Verification failed.' });
        })
      );
  }  
  
  getUsername(): Observable<string> {
    const token = this.getJwtToken();

    if (!token) {
      return of("");
    }
    
    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    return this.httpClient.get<{username :string}>(`${this.apiUrl}/api/get-username`, { headers }).pipe(
      map(response => response.username),
      catchError(error => {
        console.error("Error fetching username:", error);
        return of("");
      })
    );
  }
  
  getJwtToken() {
    return sessionStorage.getItem("token");
  }

  isLoggedIn() {
    return this.getJwtToken() != null;
  }

  logout(): void {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    this.loggedInSubject.next(false);
    this.usernameSubject.next(null);
  }
}
