import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationInterceptor implements HttpInterceptor {
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Generate correlation ID for each request
    const correlationId = uuidv4();
    
    request = request.clone({
      setHeaders: {
        'X-Correlation-ID': correlationId
      }
    });
    
    return next.handle(request);
  }
}
