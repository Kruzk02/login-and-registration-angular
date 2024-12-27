import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  username: string | null = null;
  profilePicture: SafeUrl | null = null;
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.authService.loggedIn.subscribe(status => {
      this.isLoggedIn = status;
      if (!status) {
        this.username = null;
      }
    });

    this.authService.username.subscribe(username => this.username = username);
    this.authService.getUserProfilePicture()?.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.profilePicture = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: (error) => {
        console.log("Failed to fetch profile picture", error);
      }
    });
    this.username = sessionStorage.getItem("username");
  }
}
