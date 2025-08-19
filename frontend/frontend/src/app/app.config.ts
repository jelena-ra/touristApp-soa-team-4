import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; 
import { routes } from './app.routes';

// Uvoz SharedModule-a
import { SharedModule } from './shared/shared.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // Ovo je ključni deo. Uvozimo SharedModule kako bi njegove komponente
    // bile dostupne u celoj aplikaciji.
    importProvidersFrom(SharedModule)
  ]
};
