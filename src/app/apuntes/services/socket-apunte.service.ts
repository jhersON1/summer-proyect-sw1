import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketApunteService extends Socket{
  constructor() {
    super({
      url: environment.apiUrl,
      options: {}
    });
  }
}
