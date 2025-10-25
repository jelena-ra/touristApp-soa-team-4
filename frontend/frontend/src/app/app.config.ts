import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from './shared/shared.module';
import { JwtInterceptor } from './auth/jwt/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    
    importProvidersFrom(SharedModule),
    importProvidersFrom(MarkdownModule.forRoot()), 
  ]
};