import { Injectable } from '@angular/core';
import { BaseWebSocket } from './base-web-socket';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})

export class ChatSocketService extends BaseWebSocket {
  constructor(private authService: UserService) { super(authService); }

  public async openChatSocket(boundMessagingFunction: any, roomName: string, chatType:string, optionalCloseCallback?:any) {
    const onSocketOpen = function (e) {
      console.log('CHAT OPENED!');
      this.sendMessage(null, 'fetch_messages')
    }.bind(this);

    await this.openSocket(roomName, boundMessagingFunction, onSocketOpen, `${chatType}-chat`, optionalCloseCallback);
  }

  public sendMessage(message: string, command: string) {
    const messageToSend = {
      'room': this.roomName,
      'messages': message,
      'command': command,
    };

    this.currentSocket.send(
      JSON.stringify(messageToSend)
    );
  }
}
