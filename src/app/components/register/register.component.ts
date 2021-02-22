import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataManageService } from 'src/app/services/data-manage.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fd: FormData;
  public username: string;
  public password: string;
  public email: string;
  private registerSub: Subscription;

  constructor(private dataManager: DataManageService, private userService: UserService, public toast: ToastrService) { }

  ngOnInit(): void { }

  public submitForm() {
    this.fd = new FormData();
    this.fd.append('username', this.username);
    this.fd.append('password', this.password);
    this.fd.append('email', this.email);
    this.registerSub = this.dataManager.registerUser(this.fd)
      .subscribe(res => {
        this.userService.login({ username: this.username, password: this.password });
      }, err => {
        const errorInfo = err.error;
        console.log(errorInfo)
        let message = 'Please fix the following:<ul id="SOMETHING">';
        if(errorInfo.email){
          errorInfo.email.forEach(errMessage => {
            message += `<li>${errMessage}</li>`;
          });
        }
        if(errorInfo.username){
          errorInfo.username.forEach(errMessage => {
            message += `<li>${errMessage}</li>`;
          });
        }
        message += '</ul>'
        this.toast.error(message,'',{
          enableHtml: true,
          // disableTimeOut:true
        })
      });
  }

  ngOnDestroy() {
    if (this.registerSub) {
      this.registerSub.unsubscribe();
    }
  }
}
