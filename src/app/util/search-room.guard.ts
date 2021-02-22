import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataManageService } from '../services/data-manage.service';
import { map } from 'rxjs/operators';
import { CurrentMatchModel } from '../models/current-match-model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SearchRoomGuard implements CanActivate {

  constructor(
    private dataManager: DataManageService,
    private router: Router,
    private toast: ToastrService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.dataManager.checkForCurrentMatches().pipe(map((currentMatch: CurrentMatchModel) => {
      if (currentMatch.hasActiveMatch || currentMatch.isQueued) {
        this.router.navigate(['/home'])
        this.toast.warning(`You are currently queued to be a ${currentMatch.roomInfo.userType} in a match. Cancel open matching connections to requeue.`, "Cancel Open Connections")
        return false;
      } else {
        return true;
      }
    }));
  }

}
