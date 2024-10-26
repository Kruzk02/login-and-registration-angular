import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { RegisterDTO } from '../../dtos/RegisterDTO';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [HttpClientModule, ReactiveFormsModule,RouterLink,CommonModule],
  providers: [AuthService]
})

export class RegisterComponent implements OnInit {
  
  registerDTO: RegisterDTO = { username: '', email: '', password: '' };
  registerForm!: FormGroup;
  message: string | undefined;
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    this.registerDTO = this.registerForm.value;

    this.authService.register(this.registerDTO).subscribe(response => {
      if (response.status === 'ok') {
        this.message = 'Success register';
        console.log(response.message);
      } else {
        this.message = "Failed";
        console.error(response.message);
      }
    }, error => {
      console.error('An error occurred while registering:', error);
      this.message = 'An unexpected error occurred. Please try again.';
    });    
  }
}
