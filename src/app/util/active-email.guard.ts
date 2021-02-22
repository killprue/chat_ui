import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataManageService } from '../services/data-manage.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActiveEmailGuard implements CanActivate {

  constructor(private router: Router, private dataManager: DataManageService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.dataManager.getUserSettings().pipe(map(userSettings => {
      if (localStorage.getItem("daseiner_username") === null) {
        const username = userSettings.username;
        localStorage.setItem("daseiner_username", JSON.stringify(username));
      }
      if (userSettings.isConfirmed) {
        return true;
      } else {
        this.router.navigate(['/email-confirm'])
        return false;
      }
    }));
  }
}
