import { Component, OnInit, OnDestroy, ɵConsole } from '@angular/core';
import { Router } from '@angular/router';
import { DataManageService } from 'src/app/services/data-manage.service';
import { Subscription } from 'rxjs';
import { CurrentMatchModel } from 'src/app/models/current-match-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private currentMatchCheckSub: Subscription;
  public currentMatch: CurrentMatchModel;

  constructor(
    private router: Router,
    private dataManager: DataManageService
  ) { }

  ngOnInit() {
    // Here we may need to add a spinner or something while this is timing out
    setTimeout(() => {
      this.currentMatchCheckSub = this.dataManager.checkForCurrentMatches().subscribe(res => {
        this.currentMatch = res;
      })
    }, 1250)
  };

  public lookForParticipantRoom() {
    this.router.navigate(['/searching', 'participant-match']);
  }

  public lookForJudgeRoom() {
    this.router.navigate(['/searching', 'judge-match']);
  }

  public navigateToActiveMatch() {
    console.log(this.currentMatch.roomInfo.userType);
    console.log(this.currentMatch.roomInfo.roomId)
    this.router.navigate([`/${this.currentMatch.roomInfo.userType}-chat`, this.currentMatch.roomInfo.roomId]);
  }

  ngOnDestroy() {
    this.currentMatchCheckSub.unsubscribe();
  }

}
