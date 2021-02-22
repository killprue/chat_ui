import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { RoomStatus } from '../models/room-status.model';
import { ChatTurn } from '../models/chat-turn-model';
import { Question } from '../models/questions.model';
import { environment } from '../../environments/environment';
import { UserSettings } from '../models/user-settings.model';
import { CurrentMatchModel } from '../models/current-match-model';

@Injectable({
  providedIn: 'root'
})

export class DataManageService {
  private rootPath: string;

  constructor(private http: HttpClient, private userService: UserService) {
    this.rootPath = `${environment.API_URL}api/`;
  }

  public validateRoom(roomName: string, userId: number, userType: string): Observable<any> {
    const typeCode = userType === 'participant' ? 1 : 0;
    return this.http.get<RoomStatus>(`${this.rootPath}validate-room/${roomName}--${typeCode}`);
  }

  public registerUser(load: any): Observable<any> {
    return this.http.post(this.rootPath + 'users', load);
  }

  public getUserSettings(): Observable<any> {
    return this.http.get<UserSettings>(this.rootPath + 'user-settings/');
  }

  public getChatTurn(roomName): Observable<any> {
    return this.http.get<ChatTurn>(this.rootPath + 'chat-turn/' + roomName)
  }

  public getQuestion(roomName): Observable<any> {
    return this.http.get<Question>(this.rootPath + 'question/' + roomName)
  }

  public checkForCurrentMatches():Observable<any>{
    return this.http.get<CurrentMatchModel>(this.rootPath + 'check-current-matches/')
  }

}
