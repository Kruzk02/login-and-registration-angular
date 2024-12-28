import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginDTO } from '../dtos/LoginDTO';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
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

  register(registerDTO: RegisterDTO):Observable<boolean> {
    return this.httpClient.post<{token: string}>(`${this.apiUrl}/api/register`, registerDTO, {responseType: 'json'})
    .pipe(
      map(response => {
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

  update(updateUserDTO: updateUserDTO): Observable<boolean> {
    return this.httpClient.post<{ username: string }>(`${this.apiUrl}/api/update-user`, updateUserDTO)
    .pipe(
      switchMap(response => {
        if (response.username != null) {
          return this.getUsername().pipe(
            map(username => {
              sessionStorage.setItem("username", username);
              this.usernameSubject.next(username);
              return true;
            })
          );
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }
  verify(token: string | null): Observable<{status: string, message: string}> {
    const headers = new HttpHeaders().set("Authorization", `Bearer ${this.getJwtToken()}`);
    return this.httpClient.get<{message: string}>(`${this.apiUrl}/api/verify?token=${token}`, { headers })
      .pipe(
        map(response => {
          this.router.navigateByUrl("/");
          return { status: 'success', message: response.message };
        }),
        catchError(err => {
          this.router.navigateByUrl("/");
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

  getUserProfilePicture(): Observable<Blob> | null {
    const token = this.getJwtToken();
    if (!token) {
      return null;
    }

    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`)
    return this.httpClient.get(`${this.apiUrl}/api/profile-picture`, { headers, responseType: 'blob' });
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
