import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatSocketService } from '../../services/chat-socket.service';
import { DataManageService } from '../../services/data-manage.service';
import { RoomStatus } from 'src/app/models/room-status.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ComponentCanDeactivate } from 'src/app/util/room-navigate-guard';
import { SocketResponse } from 'src/app/models/socket-response.model';
import { ChatMessage } from 'src/app/models/chat-message.model';

@Component({
  selector: 'app-chat-room',
  templateUrl: './participant-chat-room.component.html',
  styleUrls: ['./participant-chat-room.component.css']
})
export class ParticipantChatRoomComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  public messages: ChatMessage[];
  public newMessage: string;
  public chatOpen: boolean;
  public canMessage: boolean;
  public filteredTime: string;
  public question: string;
  public userId: number;
  public messageCharCount: number = 0;

  private roomIsTerminating = false;
  private browserRefresh = false;
  private unfilteredTime: number = 0;
  private roomName: string;
  private currentRoomStatus: RoomStatus;
  private matchtimeout: any;
  private syncTimeout: any;
  private refreshCatchTimeout: any;
  private clockInterval: any;
  private turnDetermineInterval: any;


  private validateRoomSub: Subscription;
  private questionSub: Subscription;
  private turnSub: Subscription;

  @ViewChild('triggerModal') triggerModalButton: ElementRef<HTMLElement>;
  @ViewChild('triggerModalDisconnect') triggerModalDisconnectButton: ElementRef<HTMLElement>;

  private checkIfDisconnected = function () {
    if (!this.chatSocketService.currentSocket) return;
    if (this.chatSocketService.currentSocket.readyState === this.chatSocketService.currentSocket.CLOSED) {
      this.validateRoom();
    }
  }.bind(this);

  constructor(
    private chatSocketService: ChatSocketService,
    private route: ActivatedRoute,
    private dataManager: DataManageService,
    private router: Router,
    private userService: UserService,
  ) {
    this.userId = userService.userid;
    this.browserRefresh = !router.navigated;
  }

  ngOnInit(): void {
    this.roomName = this.route.snapshot.paramMap.get('roomName');
    this.validateRoom();
    window.addEventListener("focus", this.checkIfDisconnected);
  }

  triggerModalClick() {
    let el: HTMLElement = this.triggerModalButton.nativeElement;
    el.click();
  }

  triggerModalDisconnectClick() {
    let el: HTMLElement = this.triggerModalDisconnectButton.nativeElement;
    el.click();
  }

  canDeactivate() {
    if (this.unfilteredTime === 0) {
      this.roomIsTerminating = true;
    }
    else if (!this.roomIsTerminating) {
      this.triggerModalClick()
    }
    return this.roomIsTerminating
  }

  confirmTermination() {
    this.terminateRoom();
  }

  acknowledgeUserTerminate() {
    this.validateRoom();
  }

  private validateRoom() {
    if (this.validateRoomSub) {
      this.validateRoomSub.unsubscribe();
    }

    this.validateRoomSub = this.dataManager.validateRoom(this.roomName, this.userId, 'participant')
      .subscribe(res => {
        this.currentRoomStatus = res;
        if (this.currentRoomStatus.isValid) {
          this.connectChatSocket();
          this.setTurnDetermineInterval();
          this.setTimer();
          this.getTurn();
          this.getQuestion();
          this.refreshCatchTimeout = setTimeout(() => {
            this.getTurn();
          }, 2000);
        }
        else {
          this.roomIsTerminating = true;
          this.router.navigate(['/home']);
        }
      });
  }

  private setTurnDetermineInterval() {
    if (!this.browserRefresh) {
      this.turnDetermineInterval = setInterval(() => {
        this.getTurn();
      }, 121000);
    } else {
      this.getRawTime();
      let closestTurnInterval = Math.floor(this.unfilteredTime / 1000 / 60);
      if (closestTurnInterval % 2 !== 0) {
        closestTurnInterval = closestTurnInterval - 1;
      }
      if (closestTurnInterval !== 0) {
        this.synchronizeRequests(closestTurnInterval);
      }
    }
  }

  private synchronizeRequests(closestTurnInterval: number) {
    const closestTurnIntervalInMili = closestTurnInterval * 1000 * 60;
    const miliRemainingBeforeTurnInterval = this.unfilteredTime - closestTurnIntervalInMili;
    this.syncTimeout = setTimeout(() => {
      this.getTurn();
      this.refreshCatchTimeout = setTimeout(() => {
        this.getTurn();
      }, 2000);
      this.turnDetermineInterval = setInterval(() => {
        this.getTurn();
      }, 121000);
    }, miliRemainingBeforeTurnInterval + 1000);
  }

  private setTimer() {
    this.getRawTime();
    this.clockInterval = setInterval(() => {
      this.getRawTime();
      const timeDifference = (this.unfilteredTime / 1000) / 60;
      let minutePortion = String(Math.floor(timeDifference));
      let secondPortion = String(((timeDifference % 1) * 0.6).toPrecision(2)).slice(2);
      if (secondPortion === '60') {
        secondPortion = '59';
      } else if (secondPortion.length > 2) {
        secondPortion = secondPortion.slice(0, 2);
      }

      this.filteredTime = `${minutePortion}:${secondPortion}`;
    }, 1000);

    this.matchtimeout = setTimeout(() => {
      clearInterval(this.clockInterval);
      clearInterval(this.turnDetermineInterval);
      this.terminateRoom();
    }, this.unfilteredTime);
  }

  public getRawTime() {
    const currentDate = this.currentRoomStatus.activatedDate.slice(0, 26);
    const endDate = moment.utc(currentDate).add(12, 'minutes') as any;
    const currentDateUtc = moment.utc() as any;
    this.unfilteredTime = (endDate - currentDateUtc);
  }

  private terminateRoom() {
    if (!this.roomIsTerminating) {
      this.roomIsTerminating = true;
      this.chatSocketService.sendMessage('TERMINATING', 'terminate_match');
      this.router.navigate(['/home']);
    } else {
      this.validateRoom();
    }
  }

  public async connectChatSocket() {
    const updateChatFunction = function (e) {
      let data = JSON.parse(e.data) as SocketResponse;
      if (data.contentType !== 'termination_notification') {
        this.messages = data.participantMessages;
      } else {
        if (!this.roomIsTerminating) {
          this.triggerModalDisconnectClick()
        }
      }
    }.bind(this);
    await this.chatSocketService.openChatSocket(updateChatFunction, this.roomName, 'participant');
    this.chatOpen = true;
  }

  public sendMessageToChat() {
    if (this.newMessage && this.canMessage == true) {
      if (this.chatSocketService.currentSocket.readyState === 1) {
        this.chatSocketService.sendMessage(this.newMessage.trim(), "new_messages")
        this.newMessage = '';
        this.messageCharCount = 0;
      }
    }
  }

  public getTurn() {
    if (this.turnSub) {
      this.turnSub.unsubscribe;
    }

    this.turnSub = this.dataManager.getChatTurn(this.roomName).subscribe(res => {
      this.canMessage = res.isUsersTurn;
    });
  }

  public getQuestion() {
    if (this.questionSub) {
      this.questionSub.unsubscribe();
    }
    this.questionSub = this.dataManager.getQuestion(this.roomName).subscribe(res => {
      this.question = res.question;
    });
  }

  public checkInput(event) {
    if (this.newMessage) {
      this.messageCharCount = this.newMessage.trim() ? this.newMessage.length : 0;
      if (this.messageCharCount > 2500) {
        this.newMessage = this.newMessage.substr(0, 2500);
        this.messageCharCount = this.newMessage.length;
      }
    }
  }


  ngOnDestroy() {
    if (this.chatSocketService.currentSocket) {
      if (this.chatSocketService.currentSocket.readyState === this.chatSocketService.currentSocket.OPEN)
        this.chatSocketService.closeSocket();
    }
    clearInterval(this.clockInterval);
    clearInterval(this.turnDetermineInterval);
    clearTimeout(this.matchtimeout);
    clearTimeout(this.syncTimeout);
    clearTimeout(this.refreshCatchTimeout);
    window.removeEventListener("focus", this.checkIfDisconnected);
    if (this.turnSub) {
      this.turnSub.unsubscribe();
    }
    if (this.questionSub) {
      this.questionSub.unsubscribe();
    }
    if (this.validateRoomSub) {
      this.validateRoomSub.unsubscribe()
    };
  }
}
