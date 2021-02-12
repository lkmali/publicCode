import {map} from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import {Injectable,} from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpClient
} from '@angular/common/http';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class AuthenticationService {
    authStorage = new AuthStorage();
    notificationStorage = new NotificationStorage();

    constructor(private http: HttpClient, private router: Router) {
    }

    isAuthorized() {
        var authData = this.authStorage.getAuthData();
        return !!authData;

    }

    getRootPath() {
        var authData = this.authStorage.getAuthData();
        if (authData.role === "admin") {
            return "admin"
        } else if (authData.role === "merchant") {
            return "merchant"
        } else {
            this.logout();
            return;
        }

    }

    sendOtp(phone: string) {
        let url = `${config.api.base}${config.api.sendOtp}`;
        return this.http.post<any>(url, {phone: phone});
    }

    verifyPhone(phone: string, verifyCode: string) {
        let url = `${config.api.base}${config.api.verifyPhone}`;
        return this.http.post<any>(url, {phone: phone, verifyCode: verifyCode})
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user['success'] && user['data']) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    this.setAuthorizationHeader(user['data']["token"])
                }

                return user;
            }));
    }

    getOrgUser() {
        return this.http.get<any>(`${config.api.base}${config.api.user}`)
            .pipe(map(role => {
                // login successful if there's a jwt token in the response
                return role;
            }));
    }

    getUser() {
        return this.http.get<any>(`${config.api.base}${config.api.user}`)
            .pipe(map(role => {
                // login successful if there's a jwt token in the response
                return role;
            }));
    }

    logout() {
        this.authStorage.removeAuthorizationHeader();
        this.notificationStorage.removeNotificationData();
        this.router.navigate(['/login']);
    }

    setLoginUserData(authResponse) {
        this.authStorage.setAuthorizationHeader(authResponse);
    }

    getNotification() {
        return this.notificationStorage.getNotificationData();
    }

    setNotification(data) {
        return this.notificationStorage.setNotificationData(data);
    }

    getAuthData() {
        return this.authStorage.getAuthData();
    }

    setAuthorizationHeader(authResponse) {
        this.authStorage.setAuthorizationHeader(authResponse);
    }

    isPathValid(url) {
        /* const authData = this.authStorage.getAuthData();
         const permission = this.config.permission[];
         return permission.component.indexOf(this.config.path[url]) >= 0;*/
    }
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // logged in so return true
        if (this.authService.isAuthorized()) {
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}


@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isAuthorized()) {
            if (this.authService.getRootPath() === "admin") {
                return true;
            }

        }
        this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        return false;
    }
}

@Injectable()
export class MerchantGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isAuthorized()) {
            if (this.authService.getRootPath() === "merchant") {
                return true;
            }

        }
        this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        return false;
    }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    authStorage = new AuthStorage();

    constructor(private router: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth header from the service.
        const authHeader = this.authStorage.getAuthorizationHeader();
        var request = req;
        if (authHeader) {
            // Clone the request to add the new header.
            request = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + authHeader)});
        }
        console.log(req.url);

        // Pass on the cloned request instead of the original request.

        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authStorage.removeAuthorizationHeader()
                this.router.navigate(['/login']);
            }

            const error = err.error.message || this.getParse(err);
            return throwError(error);
        }))
    }

    getParse(error) {
        try {
            return JSON.parse(error.error)
        } catch (err) {
            return error.statusText
        }
    }
}

export class AuthStorage {

    getAuthData(): any {
        var authData = window.localStorage.getItem('auth_token');
        if (authData) {
            return jwt_decode(authData)
        } else {
            return null;
        }
    }

    getMerchantId(): any {
        var MerchantId = window.localStorage.getItem('MerchantId');
        if (MerchantId) {
            return MerchantId;
        } else {
            return null;
        }
    }

    addMerchantId(MerchantId): any {
        localStorage.setItem('MerchantId', MerchantId);
    }

    removeMerchantId(): any {
        localStorage.removeItem('MerchantId');
    }

    getRole() {
        const authData = this.getAuthData();
        if (authData) {
            return authData.role;
        } else {
            return null
        }
    }

    getAuthorizationHeader() {
        var token = window.localStorage.getItem('auth_token');
        if (token)
            return token;
    }

    setAuthorizationHeader(authResponse) {
        localStorage.setItem('auth_token', authResponse);
    }

    removeAuthorizationHeader() {
        localStorage.removeItem('auth_token');
    }

}

export class NotificationStorage {
    getNotificationData() {
        const notification = window.localStorage.getItem('notification');
        if (notification) {
            return JSON.parse(notification);
        } else {
            return [];
        }


    }

    setNotificationData(notification) {
        localStorage.setItem('notification', JSON.stringify(notification));
    }

    removeNotificationData() {
        localStorage.removeItem('notification');
    }

}
