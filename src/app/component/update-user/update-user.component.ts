import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../service/auth.service";
import { NgIf } from "@angular/common";
import { Router } from '@angular/router';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

@Component({
  selector: 'app-update-user',
  imports: [
    ReactiveFormsModule,
    NgIf,
    ProfilePictureComponent
  ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  message: string | undefined;
  previewImageUrl: string | undefined;
  private previewUrlObject: string | null = null;

  private selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.updateForm = this.fb.group({
      username: ['', Validators.minLength(3)],
      email: ['', Validators.email],
      password: ['', Validators.minLength(3)],
      bio: [''],
      gender: ['']
    });
  }

  ngOnInit(): void {
    this.authService.getFullUserDetails().subscribe((user) => {
      if (user && user.mediaId) {
        this.authService.getUserProfilePicture(user.mediaId).subscribe(blob => {
          if (this.previewUrlObject) {
            URL.revokeObjectURL(this.previewUrlObject);
          }
          this.previewUrlObject = URL.createObjectURL(blob);
          this.previewImageUrl = this.previewUrlObject;
        })
      }
    })
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    fileInput.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        if (this.previewUrlObject) {
          URL.revokeObjectURL(this.previewUrlObject);
          this.previewUrlObject = null;
        }
        this.previewImageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
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
    formData.append('gender', this.updateForm.get('gender')?.value);

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.authService.update(formData).subscribe({
      next: (success) => {
        this.message = success
          ? 'User information updated successfully!'
          : 'Failed to update user information.';
        if (success) {
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      },
      error: () => {
        this.message = 'An error occurred while updating user information.';
      },
    });
  }
}
