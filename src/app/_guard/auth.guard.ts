import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../_services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService)
  let router = inject(Router)
  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};