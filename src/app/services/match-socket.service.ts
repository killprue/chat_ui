import { Injectable } from '@angular/core';
import { BaseWebSocket } from './base-web-socket';
import { UserService } from './user.service';
import { v4 as uuid } from 'uuid';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class MatchSocketService extends BaseWebSocket {

  public typeToMatch: string;

  constructor(private authService: UserService, private route: ActivatedRoute) {
    super(authService);
  }

  public async openMatchMatching(boundMatchingFunction: any) {
    this.typeToMatch = window.location.href.split('/')[window.location.href.split('/').length -1];
    const openingFunction = function (e) {
      console.log('MATCHING OPENED!');
      this.askForMatch();
    }.bind(this);

    await this.openSocket(uuid(), boundMatchingFunction, openingFunction, this.typeToMatch);
  }

  public askForMatch() {
    const messageToSend = {
      'command': 'find_match'
    }
    const message = JSON.stringify(messageToSend)
    this.currentSocket.send(message);
  }
}
