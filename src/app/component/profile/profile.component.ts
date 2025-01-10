import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProfilePictureComponent } from "../profile-picture/profile-picture.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, ProfilePictureComponent],
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
    this.username = sessionStorage.getItem("username");
  }
}
