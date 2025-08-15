import { Injectable } from '@angular/core';
import { NotificationComponent, NotifyOptions } from './notification/notification.component';
import { NotificationType } from './model/notificationType.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationComponent!: NotificationComponent;

  register(notificationComponent: NotificationComponent) {
    this.notificationComponent = notificationComponent;
  }

  notify({
      message,
      duration = 3000,
      action,
      actionCallback,
      messageSender= 'Mima',
      notificationType = NotificationType.INFO}: NotifyOptions
  ) {
    if (this.notificationComponent) {
      this.notificationComponent.showNotification({
        message,
        duration,
        action,
        actionCallback,
        messageSender,
        notificationType
    });
    }
  }
}
