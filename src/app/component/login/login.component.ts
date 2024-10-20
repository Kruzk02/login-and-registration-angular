import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { LoginDTO } from '../../dtos/LoginDTO';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule,RouterLink,CommonModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  
  loginDTO: LoginDTO = {username: '',password: ''};
  loginForm!: FormGroup;
  message: string | undefined;

  constructor(private authService: AuthService) {}

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

    this.authService.login(this.loginDTO).subscribe(response => {
      if (response) {
        this.message = 'Success Login';
      }else {
        this.message = 'Failed';
      }
    }, error => {
      console.error('An error occurred while login:', error);
      this.message = 'An unexpected error occurred. Please try again.';
    });   
  }
}
