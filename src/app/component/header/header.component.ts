import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  username: string | null = null;
  isLoggedIn: boolean = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loggedIn.subscribe(status => {
      this.isLoggedIn = status;
      if (!status) {
        this.username = null;
      }
    });

    this.authService.username.subscribe(username => this.username = username);
    
    this.username = sessionStorage.getItem("username");
    this.isLoggedIn = !!sessionStorage.getItem("token");
  }

  logout() {
    this.authService.logout();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const dropdown = document.getElementById('dropdown');
    const targetElement = event.target as HTMLElement;

    if (dropdown && !dropdown.contains(targetElement) && !targetElement.closest('.dropdown-button')) {
      this.isDropdownOpen = false;
    }
  }
}