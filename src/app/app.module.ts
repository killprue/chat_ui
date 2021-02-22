import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthInterceptor } from './util/auth.interceptor';
import { ParticipantChatRoomComponent } from './components/participant-chat-room/participant-chat-room.component';
import { SearchingComponent } from './components/searching/searching.component';
import { EmailConfirmComponent } from './components/email-confirm/email-confirm.component';
import { RegisterComponent } from './components/register/register.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { RoomNavigateGuard } from './util/room-navigate-guard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { JudgeChatRoomComponent } from './components/judge-chat-room/judge-chat-room.component';
import { JudgeChatBoxComponent } from './components/judge-chat-box/judge-chat-box.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ParticipantChatRoomComponent,
    SearchingComponent,
    EmailConfirmComponent,
    RegisterComponent,
    ChatBoxComponent,
    JudgeChatRoomComponent,
    JudgeChatBoxComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    FormsModule,
    FontAwesomeModule,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, RoomNavigateGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
