import { Component, OnInit, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { ChatMessage } from '../../models/chat-message.model';

@Component({
  selector: 'app-judge-chat-box',
  templateUrl: './judge-chat-box.component.html',
  styleUrls: ['./judge-chat-box.component.css']
})
export class JudgeChatBoxComponent implements OnInit {

  @Input() chatMessages: ChatMessage[];
  @Input() currentUser: number;
  @Input() question: string;
  @Input() filteredTime: string;
  @Input() viewingParticipantMessages: boolean;
  @ViewChild('scrollViewJudge') scrollViewJudge: ElementRef;
  public roundApproaching: boolean;


  constructor() { }

  ngOnInit(): void {
  }

  private checkIfNextRoundApproaching() {
    if (this.filteredTime) {
      const minSec = this.filteredTime.split(':');
      const minutes = parseInt(minSec[0]);
      const seconds = parseInt(minSec[1]);
      this.roundApproaching = [10, 8, 6, 4, 2, 0].includes(minutes) && [0, 1, 2, 3, 4, 6, 8, 10].includes(seconds);
    }
  }


  public isCurrentUser(userid: number) {
    return this.currentUser === userid;
  }

  private updateScrollView() {
    setTimeout(() => {
      this.scrollViewJudge.nativeElement.scrollTop = this.scrollViewJudge.nativeElement.scrollHeight;
    }, 1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.viewingParticipantMessages || changes.chatMessages) && this.viewingParticipantMessages) {
      this.updateScrollView();
    } else if (changes.filteredTime) {
      this.checkIfNextRoundApproaching();
    }
  }

}
