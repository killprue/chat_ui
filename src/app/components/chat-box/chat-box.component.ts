import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { ChatMessage } from 'src/app/models/chat-message.model';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit, OnChanges {

  @Input() chatMessages: ChatMessage[];
  @Input() currentUser: number;
  @Input() question: string;
  @Input() filteredTime: string;
  @ViewChild('scrollView') scrollView: ElementRef;
  public roundApproaching: boolean;


  constructor() { }

  ngOnInit(): void {
    this.updateScrollView();
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
      this.scrollView.nativeElement.scrollTop = this.scrollView.nativeElement.scrollHeight;
    }, 1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.scrollView && !changes.filteredTime) {
      this.updateScrollView();
    } else if (changes.filteredTime) {
      this.checkIfNextRoundApproaching();
    }
  }
}
