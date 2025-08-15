import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { NotificationType } from './model/notificationType.enum';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {

  constructor(private notificationService: NotificationService, private router: Router) { }

  handleHttpError(error: HttpErrorResponse): void {
    switch (true) {
      case error.status >= 100 && error.status < 200:
        console.warn('Informational response received:', error.message);
        this.notificationService.notify({
          message: `Informational response received:` + error.message,
          duration: 3000,
          notificationType: NotificationType.INFO
        }
        );
        break;

      case error.status >= 200 && error.status < 300:
        console.log('Successful response:', error.message);
        break;

      case error.status >= 300 && error.status < 400:
        console.warn('Redirection response:', error.message);
        this.notificationService.notify({
          message: `Redirection response: ${error.message}`,
          duration: 3000,
          notificationType: NotificationType.INFO
        });
        break;

      case error.status >= 400 && error.status < 500:
        switch (error.status) {
          case 400:
            console.error('Bad Request: Please check the sent data.');
            this.notificationService.notify({ message: 'Bad Request: Please check the sent data.', duration: 3000, notificationType: NotificationType.ERROR });
            break;
          case 401:
            console.error('Unauthorized: Authentication is required.');
            this.notificationService.notify({
              message: 'Unauthorized: Authentication is required.',
              duration: 4000, action: 'Login',
              actionCallback: () => this.router.navigate(['/login']), notificationType: NotificationType.ERROR
            });
            break;
          case 403:
            console.error('Forbidden: You do not have permission to perform this action.');
            this.notificationService.notify({
              message: 'Forbidden: You do not have permission to perform this action.',
              duration: 3000, notificationType: NotificationType.ERROR
            });
            break;
          case 404:
            console.error('Not Found: The requested resource could not be found.');
            this.notificationService.notify({
              message: 'Not Found: The requested resource could not be found.',
              duration: 3000,
              notificationType: NotificationType.WARNING
            }
            );
            break;
          default:
            console.error(`Client Error (${error.status}): ${error.message}`);
            this.notificationService.notify({
              message: `Client Error (${error.status}): ${error.message}`,
              duration: 5000,
              notificationType: NotificationType.ERROR
            });
        }
        break;

      case error.status >= 500 && error.status < 600:
        console.error(`Server Error (${error.status}): ${error.message}`);
        this.notificationService.notify({
          message: `Server Error (${error.status}): ${error.message}. Please try again later.`,
          duration: 5000,
          notificationType: NotificationType.ERROR
        });
        break;

      default:
        console.error(`Unexpected status code (${error.status}): ${error.message}`);
        this.notificationService.notify({
          message: `Unexpected status code (${error.status}): ${error.message}`,
          duration: 5000,
          notificationType: NotificationType.ERROR
        });
        break;
    }
  }
}
