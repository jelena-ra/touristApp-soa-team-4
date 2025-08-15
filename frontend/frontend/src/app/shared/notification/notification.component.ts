import { Component } from '@angular/core';
import { NotificationType } from '../model/notificationType.enum';

interface Notification {
  message: string;
  timeout: number;
  action?: string;
  notificationType: NotificationType;
  sender?: string;
  actionCallback?: () => void;
  removing?: boolean; // Ovo je potrebno za animaciju uklanjanja
}

export interface NotifyOptions {
  message: string,
    duration: number,
    action?: string,
    actionCallback?: () => void,
    messageSender?: string,
    notificationType?: NotificationType,
}

@Component({
  selector: 'app-notification-component',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  notifications: Notification[] = [];
  backgroundColor: string = 'default'; // Dodatna boja za obaveštenje

  showNotification({
    message,
    duration = 3000,
    action,
    actionCallback,
    messageSender= 'Duško',
    notificationType = NotificationType.INFO}: NotifyOptions
  ) {
    const notification: Notification = { message: message, timeout: duration + 2000, action: action, actionCallback: actionCallback, sender: messageSender, notificationType: notificationType };
    this.notifications.push(notification);

    // Automatsko uklanjanje nakon trajanja
    setTimeout(() => {
      this.startRemovingNotification(notification);
    }, notification.timeout);
  }

  startRemovingNotification(notification: Notification) {
    notification.removing = true; // Dodaj klasu za izlazak

    // Ukloni iz liste nakon završetka animacije
    setTimeout(() => {
      this.notifications = this.notifications.filter((n) => n !== notification);
    }, 300); // Trajanje `slideOut` animacije
  }

  handleAction(notification: Notification) {
    if (notification.actionCallback) {
      notification.actionCallback(); // Poziv callback-a
    }
    this.startRemovingNotification(notification); // Odmah ukloni obaveštenje
  }
}