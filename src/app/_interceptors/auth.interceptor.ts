import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "../_services/auth.service";
import {catchError, switchMap, throwError} from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAuthTokenFromStorage();

  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      console.log('Caught error:', error); // Log the error

      if (error.status === 401) {
        console.log('401 error detected, attempting to refresh token'); // Log the detection of a 401 error

        return authService.refreshTokenMethod().pipe(
          switchMap((token: any) => {
            console.log('Token refreshed:', token); // Log the new token

            authService.setTokens(token.access_token, token.refresh_token);
            if (authToken && !req.headers.has('Authorization')) {
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${authToken}`
                }
              });
            }

            return next(req);  // Ensure an Observable is returned here
          }),
          catchError(err => {
            console.log('Token refresh failed, logging out', err); // Log the refresh failure
            //We only want to log out if we're not logged in - browsing the home page while not logged in is valid
            // if (authService.isLoggedIn()) {
            authService.logout();
            // }
            return throwError(err);
          })
        );
      }

      return throwError(error);
    })
  );
};
