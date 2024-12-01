import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { TokenGuard } from './guards/token.guard';
import { VerifyComponent } from './component/verify/verify.component';

export const routes: Routes = [
    {path: 'login', canActivate: [AuthGuard], component: LoginComponent},
    {path: 'register', canActivate: [AuthGuard], component: RegisterComponent},
    {path: 'verify',canActivate: [TokenGuard], component: VerifyComponent}
];
