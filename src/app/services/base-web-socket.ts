import { UserService } from './user.service';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

export class BaseWebSocket implements OnDestroy {

  public currentSocket: WebSocket;
  private domain: string;
  public roomName: string;
  private retryAttempt = 0;
  private refreshSub: Subscription;

  constructor(private userService: UserService) {
    this.domain = environment.DOMAIN;
  }

  public async openSocket(roomName: string, communicationCallback: any, openingCallback: any, socketRoot: string, optionalCloseCallback?: any, ) {
    this.roomName = roomName;
    const wsStart = window.location.protocol == "https:" ? "wss" : "ws"
    this.currentSocket = await new WebSocket(
      `${wsStart}://${this.domain}/ws/${socketRoot}/${this.roomName}/?token=${this.userService.getCurrentToken()}`
    );

    const onRefreshOpen = async function (res) {
      this.userService.updateData(res)
      if (this.currentSocket.readyState === this.currentSocket.CLOSED) {
      await this.openSocket(this.roomName, communicationCallback, openingCallback, socketRoot, optionalCloseCallback);
      }
    }.bind(this);

    const onErrorsHandleRefresh = async function (e) {
      this.closeSocket();
      this.retryAttempt++;
      if (this.refreshSub) {
        this.refreshSub.unsubscribe();
      }
      // Will need this logic again when figuring out how to properly authenticate a ws connection to user.
      // Right now, the backend does not check for valid of expired token, just that a user is in the token..
      // this.refreshSub = this.userService.refreshToken()
      //   .subscribe(onRefreshOpen);
      await this.openSocket(this.roomName, communicationCallback, openingCallback, socketRoot, optionalCloseCallback);

    }.bind(this);

    const onCloseSocket = function (e) {
      console.log('SOCKET CLOSED!');
    };

    this.currentSocket.onmessage = communicationCallback;
    this.currentSocket.onerror = onErrorsHandleRefresh;
    this.currentSocket.onclose = optionalCloseCallback ? optionalCloseCallback : onCloseSocket;
    this.currentSocket.onopen = openingCallback;
  }

  public closeSocket() {
    this.currentSocket.close();
  }

  public ngOnDestroy() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
    this.closeSocket();
  }
}
