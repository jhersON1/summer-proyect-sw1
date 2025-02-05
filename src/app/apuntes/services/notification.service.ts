import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendNotification(email: string, apunteUrl: string) {
    return this.http.post(`${this.apiUrl}/notification/send`, {
      email,
      apunteUrl
    });
  }
}
