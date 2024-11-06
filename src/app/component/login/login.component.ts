import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { LoginDTO } from '../../dtos/LoginDTO';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  
  loginDTO: LoginDTO = {username: '',password: ''};
  loginForm!: FormGroup;
  message: string | undefined;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required)
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return
    }

    this.loginDTO = this.loginForm.value;

    this.authService.login(this.loginDTO).subscribe({
      next: (response) => {
        if (response) {
          this.message = 'Success Login, redirecting to home page';
          setTimeout(() => {
            this.router.navigate(['/'])
          },5000)
        } else {
          this.message = 'username or password is incorrect';
        }
      },
      error: (err) => {
        this.message = err?.message;
      }
    })
  }
}
