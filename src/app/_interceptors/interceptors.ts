import {Injectable} from "@angular/core";
import {HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {Observable, tap} from "rxjs";

@Injectable()
export class Interceptors {
  static cacheInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    const reqWithHeader = req.clone({
      headers: req.headers
        .set('Cache-Control', ['no-cache', 'must-revalidate', 'no-store', 'post-check=0', 'pre-check=0'])
        .set('Pragma', 'no-cache')
        .set('Expires', '0')
    });
    return next(reqWithHeader)
  }

  static loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    // return next(req).pipe(tap(event => {
    //   if (event.type === HttpEventType.Response) {
    //     console.log(req.url, 'returned a response with status', event.status);
    //   }
    // }));
    return next(req)
  }
}
