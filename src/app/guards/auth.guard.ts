import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export class AuthGuard {
  constructor(private authService: AuthService,private router: Router){}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login'])
      return false;
    }
  }
}
