import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { DataManageService } from '../services/data-manage.service';
import { map } from 'rxjs/operators';
import { UserSettings } from '../models/user-settings.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmedEmailGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
    private dataManager: DataManageService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check email has already been verified. If so, deny access to this route
    return this.dataManager.getUserSettings().pipe(map((userSettings:UserSettings)=> {
      if (userSettings.isConfirmed) {
        this.router.navigate(['/home'])
        return false;
      } else {
        return true;
      }
    }));
  }

}
