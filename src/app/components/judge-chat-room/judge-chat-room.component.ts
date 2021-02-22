import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ChatSocketService } from '../../services/chat-socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataManageService } from '../../services/data-manage.service';
import { UserService } from '../../services/user.service';
import { SocketResponse } from '../../models/socket-response.model';
import { Subscription } from 'rxjs';
import { RoomStatus } from '../../models/room-status.model';
import * as moment from 'moment';
import { ChatMessage } from '../../models/chat-message.model';

@Component({
  selector: 'app-judge-chat-room',
  templateUrl: './judge-chat-room.component.html',
  styleUrls: ['./judge-chat-room.component.css']
})
export class JudgeChatRoomComponent implements OnInit {
  public messagesToShow: ChatMessage[];
  public filteredTime: string;
  public messageCharCount: number = 0;
  public userId: number;
  public newMessage: string;
  public chatOpen: boolean;
  public question: string;
  public showJudgeMessages: boolean;
  public receivedTerminationAlert: boolean;
  public roomIsReady:boolean;

  private roomName: string;
  private currentRoomStatus: RoomStatus;
  private clockInterval: any;
  private unfilteredTime: number = 0;
  private browserRefresh: boolean;
  public judgeMessages: ChatMessage[];
  public participantMessages: ChatMessage[];

  private validateRoomSub: Subscription;
  private questionSub: Subscription;

  @ViewChild('triggerModalDisconnect') triggerModalDisconnectButton: ElementRef<HTMLElement>;

  private checkIfDisconnected = function () {
    if (!this.chatSocketService.currentSocket) return;
    if (this.chatSocketService.currentSocket.readyState !== this.chatSocketService.currentSocket.OPEN) {
      this.chatOpen = false;
      this.validateRoom();
    } else {

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

  triggerModalDisconnectClick() {
    let el: HTMLElement = this.triggerModalDisconnectButton.nativeElement;
    el.click();
  }

  acknowledgeUserTerminate(){
    this.validateRoom();
  }

  private validateRoom() {
    if (this.validateRoomSub) {
      this.validateRoomSub.unsubscribe();
    }
    this.validateRoomSub = this.dataManager.validateRoom(this.roomName, this.userId, 'judge')
      .subscribe(async res => {
        this.currentRoomStatus = res;
        if (this.currentRoomStatus.isValid) {
          await this.connectChatSocket();
          // Default to judge messages
          this.showJudgeMessages = true;
          this.messagesToShow = this.judgeMessages;
          this.getQuestion();
          this.setTimer();
          this.roomIsReady = true;
        }
        else {
          this.router.navigate(['/home']);
        }
      });
  }

  public async connectChatSocket() {
    const updateChatFunction = function (e) {
      let data = JSON.parse(e.data) as SocketResponse;
      if (data.contentType !== 'termination_notification') {

        if (data.judgeMessages) {
          this.judgeMessages = data.judgeMessages;
        }

        if (data.participantMessages) {
          this.participantMessages = data.participantMessages;
        }

        this.messagesToShow = this.showJudgeMessages ? this.judgeMessages : this.participantMessages;

      } else {
        if (!this.notifiedOfTermination) {
          this.notifiedOfTermination = true;
          this.triggerModalDisconnectClick();
        }
      }
    }.bind(this);

    await this.chatSocketService.openChatSocket(updateChatFunction, this.roomName, 'judge');
    this.chatOpen = true;
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
  }

  public getRawTime() {
    const currentDate = this.currentRoomStatus.activatedDate.slice(0, 26);
    const endDate = moment.utc(currentDate).add(12, 'minutes') as any;
    const currentDateUtc = moment.utc() as any;
    this.unfilteredTime = (endDate - currentDateUtc);
  }


  public sendMessageToChat() {
    if (this.newMessage) {
      if (this.chatSocketService.currentSocket.readyState === 1) {
        this.chatSocketService.sendMessage(this.newMessage.trim(), "new_messages")
        this.newMessage = '';
        this.messageCharCount = 0;
      }
    }
  }


  public getQuestion() {
    if (this.questionSub) {
      this.questionSub.unsubscribe();
    }

    this.questionSub = this.dataManager.getQuestion(this.roomName)
      .subscribe(res => {
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

  public swapChatView(event) {
    const elementToggled = event.target.id;
    this.showJudgeMessages = elementToggled === 'judgeChoice' ? true : false;
    this.messagesToShow = this.showJudgeMessages ? this.judgeMessages : this.participantMessages;
  }


  ngOnDestroy() {
    if (this.chatSocketService.currentSocket) {
      if (this.chatSocketService.currentSocket.readyState === this.chatSocketService.currentSocket.OPEN)
        this.chatSocketService.closeSocket();
    }

    clearInterval(this.clockInterval);
    if (this.validateRoomSub) {
      this.validateRoomSub.unsubscribe();
    }
    if (this.questionSub) {
      this.questionSub.unsubscribe();
    }
    window.removeEventListener("focus", this.checkIfDisconnected);
  }
}
