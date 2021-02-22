import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatchSocketService } from '../../services/match-socket.service';


@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.css']
})
export class SearchingComponent implements OnInit, OnDestroy {

  constructor(private matchSocketService: MatchSocketService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.connectMatchSocket();
  }

  public async connectMatchSocket() {
    const searchType = await this.route.snapshot.paramMap.get('searchType');
    const updateMatch = function (e) {
      const data = JSON.parse(e.data)
      this.matchSocketService.closeSocket();
      this.router.navigate([`/${searchType.split('-')[0]}-chat`, data]);
    }.bind(this);

    await this.matchSocketService.openMatchMatching(updateMatch);
  }

  ngOnDestroy() {
    this.matchSocketService.closeSocket();
  }
}
