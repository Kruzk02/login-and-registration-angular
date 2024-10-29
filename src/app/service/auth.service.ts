import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginDTO } from '../dtos/LoginDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public loggedIn = this.loggedInSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(null);
  public username = this.usernameSubject.asObservable();
  
  constructor(private httpClient: HttpClient) { }

  register(registerDTO: RegisterDTO):Observable<any> {
    return this.httpClient.post("http://localhost:8080/api/register", registerDTO, {responseType: 'json'})
    .pipe(
      catchError(error => {
        return of({ status: 'error', message: 'Username or email already taken' });
      })
    );
  }

  login(loginDTO: LoginDTO):Observable<boolean> {
    return this.httpClient.post<{status: string, token: string, timestamp: string}>("http://localhost:8080/api/login", loginDTO)
      .pipe(map(response => {
        if (response.status === 'ok' && response.token) {
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
  
  getUsername(): Observable<string> {
    const token = this.getJwtToken();

    if (!token) {
      return of("");
    }
    
    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    return this.httpClient.get<{username :string}>("http://localhost:8080/api/get-username", { headers }).pipe(
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
