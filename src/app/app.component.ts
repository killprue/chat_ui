import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { Router, GuardsCheckEnd, NavigationEnd } from '@angular/router';

import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  public isLoggedIn = false;
  public username: string;
  public navBarIsToggled = false;
  public faGlobe = faGlobe;
  public faCogs = faCogs;
  public faComments = faComments;
  public faSignOutAlt = faSignOutAlt;
  public faBars = faBars;
  public appTitle = "Daseiner";

  constructor(public userService: UserService, private router: Router, private toast: ToastrService) {
    this.username = userService.getUsername();
  }

  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedIn()
    this.router.events.pipe(
      filter(event => (event instanceof GuardsCheckEnd) || event instanceof NavigationEnd)
    ).subscribe(event => {
      this.isLoggedIn = this.userService.isLoggedIn();
      this.username = this.userService.getUsername();
    });
  }

  public logout() {
    const curPath = window.location.href.split('/')[3];
    if (curPath === 'participant-chat') {
      this.toast.warning(
        "You are currently in a match. Navigate home and select Understood from the prompt to terminate. Then logout.",
        "Cancel Match First!",
        {
          closeButton: true,
          disableTimeOut: true
        }
      )
    } else {
      this.userService.logout();
    }
  }

  public toggleNav() {
    this.navBarIsToggled = this.navBarIsToggled ? false : true;
  }

  public collapseNavIfToggled() {
    if (this.navBarIsToggled) {
      this.navBarIsToggled = false;
    }
  }
}
