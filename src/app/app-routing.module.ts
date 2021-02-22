import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './util/auth.guard';
import { AuthenticatedUserGuard } from './util/authenticated-user.guard';
import { ParticipantChatRoomComponent } from './components/participant-chat-room/participant-chat-room.component';
import { SearchingComponent } from './components/searching/searching.component';
import { ActiveEmailGuard } from './util/active-email.guard';
import { EmailConfirmComponent } from './components/email-confirm/email-confirm.component';
import { ConfirmedEmailGuard } from './util/confirmed-email.guard';
import { RegisterComponent } from './components/register/register.component';
import { RoomNavigateGuard } from './util/room-navigate-guard';
import { JudgeChatRoomComponent } from './components/judge-chat-room/judge-chat-room.component';
import { SearchRoomGuard } from './util/search-room.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthenticatedUserGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthenticatedUserGuard] },
  {
    path: '', canActivate: [AuthGuard], children: [
      { path: 'email-confirm', component: EmailConfirmComponent, canActivate: [ConfirmedEmailGuard] },
      {
        path: '', canActivate: [ActiveEmailGuard], children: [
          { path: 'home', component: HomeComponent },
          { path: "searching/:searchType", component: SearchingComponent,canActivate:[SearchRoomGuard] },
          { path: 'judge-chat/:roomName', component: JudgeChatRoomComponent},
          { path: 'participant-chat/:roomName', component: ParticipantChatRoomComponent, canDeactivate: [RoomNavigateGuard] },
          { path: '**', redirectTo: 'home', pathMatch: 'full' },
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];




@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
