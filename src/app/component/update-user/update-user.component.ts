import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../service/auth.service";
import { NgIf } from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-user',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  message: string | undefined;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.updateForm = this.fb.group({
      username: ['', Validators.minLength(3)],
      email: ['', Validators.email],
      password: ['', Validators.minLength(3)],
      bio: [''],
      profilePicture: [''],
      gender: [''],
    })
  }

  ngOnInit(): void {
    this.authService.getFullUserDetails().subscribe((user) => {
      if (user) {
        this.updateForm.patchValue({
          username: user.username,
          email: user.email,
          bio: user.bio,
          gender: user.gender,
        })
      }
    })
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('username', this.updateForm.get('username')?.value);
    formData.append('email', this.updateForm.get('email')?.value);
    formData.append('password', this.updateForm.get('password')?.value);
    formData.append('bio', this.updateForm.get('bio')?.value);

    const profilePictureInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (profilePictureInput.files && profilePictureInput.files.length > 0) {
      formData.append('profilePicture', profilePictureInput.files[0]);
    }

    this.authService.update(formData).subscribe({
      next: (success) => {
        this.message = success
          ? 'User information updated successfully!'
          : 'Failed to update user information.';
        if (success) {
          setTimeout(() => this.router.navigate(['/']), 5000);
        }
      },
      error: () => {
        this.message = 'An error occurred while updating user information.';
      },
    });
  }

}
