import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { RegisterDTO } from '../../dtos/RegisterDTO';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    providers: [AuthService]
})

export class RegisterComponent implements OnInit {

  registerDTO: RegisterDTO = { username: '', email: '', password: '' };
  registerForm!: FormGroup;
  message: string | undefined;

  constructor(private authService: AuthService, private router: Router) { }

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

    this.authService.register(this.registerDTO).subscribe({
      next: (response) => {
        if (response) {
          this.message = 'Success register, check your email';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 5000);
        } else {
          this.message = 'Username or email already taken'
        }
      },
      error: (err) => {
        this.message = err?.message;
      }
    });
  }
}
