import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from '../services/user.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(public userService: UserService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(this.addAuthenticationToken(request)).pipe(
            catchError(error => {
                if (!(["api-token-refresh", "api-token-auth", "users"].some(x => request.url.includes(x)))) {
                    if (error.status !== 403) {
                        throw (error);
                    }
                    return this.userService.refreshToken().pipe(
                        switchMap((token: any) => {
                            this.userService.updateData(token)
                            return next.handle(this.addAuthenticationToken(request));
                        }),
                        catchError((err: any) => {
                            this.userService.logout();
                            throw (err);
                        })
                    )
                } else {
                    throw (error);
                }
            })
        )
    }

    addAuthenticationToken(request) {
        const accessToken = this.userService.getCurrentToken();

        if (!accessToken) {
            return request;
        }

        return request.clone({
            setHeaders: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken
            }
        });
    }
}
