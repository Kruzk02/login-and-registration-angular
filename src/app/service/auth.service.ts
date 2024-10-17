import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { catchError, map, Observable, of } from 'rxjs';
import { LoginDTO } from '../dtos/LoginDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Output() loggedIn: EventEmitter<boolean> = new EventEmitter();
  @Output() username: EventEmitter<string> = new EventEmitter();
 
  constructor(private httpClient: HttpClient) { }

  register(registerDTO: RegisterDTO):Observable<any> {
    return this.httpClient.post("http://localhost:8080/api/register", registerDTO, {responseType: 'json'})
    .pipe(
      catchError(error => {
        //Todo: add notification
        return of(null);
      })
    );
  }

  login(loginDTO: LoginDTO):Observable<boolean> {
    return this.httpClient.post<string>("http://localhost:8080/api/login", loginDTO)
      .pipe(map(data => {
        localStorage.setItem("token",data);
        return true;
      }),
      catchError(error => {
        this.loggedIn.emit(false);
        //Todo: add notification
        return of(false);
      }))
  }

  getJwtToken() {
    return localStorage.getItem("token");
  }

  isLoggedIn() {
    return this.getJwtToken() != null;
  }
}
