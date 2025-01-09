import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from "../../service/auth.service";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [],
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.css'
})
export class ProfilePictureComponent implements OnInit{

  @Input() size: string = '50px';
  @Input() altText: string = 'Profile Picture';

  profileImageUrl: SafeUrl | null = null;

  constructor(private authService: AuthService, private domSantizer: DomSanitizer) {}

  ngOnInit(): void {
    this.fetchProfilePicture();
  }

  fetchProfilePicture(): void {
    this.authService.getUserProfilePicture().subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.profileImageUrl = this.domSantizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error(err?.message);
      }
    })
  }
}
