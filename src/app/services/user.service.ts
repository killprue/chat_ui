import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment'
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})

export class UserService implements OnDestroy {
  private rootpath: string;
  private httpOptions: any;
  public token_expires: Date;
  public userid: number;
  public errors: any = [];
  private authSub: Subscription;

  constructor(private http: HttpClient, private router: Router, public toast: ToastrService) {
    this.rootpath = environment.API_URL;
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    const token = this.getCurrentToken()
    if (token !== null) {
      this.gleenTokenInfo(token);
    }
  }

  public login(user) {
    this.authSub = this.http.post(this.rootpath +
      'api-token-auth/', JSON.stringify(user), this.httpOptions)
      .subscribe(
        data => {
          this.updateData(data);
          this.router.navigate(['/home']);
          window.location.reload();
        },
        err => {
          this.toast.error('The username and password you entered did not match our records. Please double-check and try again.')
        }
      );
  }

  public refreshToken() {
    if (localStorage.getItem("daseiner_auth") !== null) {
      const refreshToken = JSON.parse(localStorage.getItem("daseiner_auth_refresh"));
      return this.http.post(this.rootpath +
        'api-token-refresh/', { 'refresh': refreshToken }, this.httpOptions).pipe()
    }
  }

  public async logout() {
    const curPath = window.location.href.split('/')[3];
    await this.router.navigate([''])
    const pathAfter = window.location.href.split('/')[3];
    if (curPath !== pathAfter && pathAfter === 'chat' || pathAfter !== 'chat') {
      if (this.isLoggedIn) {
        localStorage.removeItem("daseiner_auth");
        localStorage.removeItem("daseiner_auth_refresh");
        localStorage.removeItem("daseiner_username");
      }
      this.token_expires = null;
      window.location.reload();
    }
  }

  public updateData(data) {
    const accessToken = data['access'];
    const refreshToken = data['refresh'];

    if (accessToken) {
      localStorage.setItem("daseiner_auth", JSON.stringify(accessToken));
    }

    if (refreshToken) {
      localStorage.setItem("daseiner_auth_refresh", JSON.stringify(refreshToken));
    }

    this.errors = [];
    this.gleenTokenInfo(accessToken);
  }

  private gleenTokenInfo(token) {
    var token_parts = "";
    if (token) {
      token_parts = token.split(/\./);
    }
    const token_decoded = JSON.parse(window.atob(token_parts[1]));
    this.userid = token_decoded.user_id;
    this.token_expires = new Date(token_decoded.exp * 1000);

  }

  public isLoggedIn() {
    return localStorage.getItem("daseiner_auth") !== null ?
      true :
      false;
  }

  public getCurrentToken() {
    let token = null;
    if (this.isLoggedIn()) {
      token = JSON.parse(localStorage.getItem("daseiner_auth"));
    }
    return token;
  }

  public getUsername() {
    let username = null;
    if (localStorage.getItem("daseiner_username") !== null) {
      username = JSON.parse(localStorage.getItem("daseiner_username"));
    }
    return username;
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
