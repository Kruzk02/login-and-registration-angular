import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VerificationTokenDTO } from '../../dtos/VerificationTokenDTO';

@Component({
  selector: 'app-verify',
  imports: [FormsModule, CommonModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
  providers: [AuthService]
})
export class VerifyComponent {

  otpBoxes = Array(6).fill('');
  token: string[] = Array(6).fill('');
  verficationTokenDTO: VerificationTokenDTO = { token: '' };
  message: string | null = "";

  constructor(private authService: AuthService, private router: Router) { }

  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    if (input.value) {
      input.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') || '';
    if (/^\d+$/.test(pasteData) && pasteData.length === this.otpBoxes.length) {
      this.token = pasteData.split('');
      event.preventDefault();
    }
  }

  verifyCode(): void {
    const code = this.token.join('');
    if (code.length == this.token.length) {
      this.verficationTokenDTO = { token: code };
      this.authService.verify(this.verficationTokenDTO).subscribe({
        next: (response) => {
          this.message = response.message;
          setTimeout(() => {
            this.router.navigate(["/"])
          }, 5000)
        },
        error: (err) => {
          this.message = err.message;
        }
      });
    } else {
      alert("Please enter full code");
    }
  }

  reVerify(): void {
    this.authService.reVerify().subscribe({
      next: (response) => {
        this.message = response.message;
      },
      error: (err) => {
        this.message = err.message;
      }
    });
  }
}
