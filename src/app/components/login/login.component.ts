import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user = { username: '', password: '' };


  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.user = { username: '', password: '' }
  }

  public login() {
    this.userService.login(this.user)
  }
}
