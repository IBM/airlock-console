import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {AirlockService} from "./airlock.service";
import {environment} from "../../environments/environment";

@Injectable()
export class AuthGuard implements CanActivate {
    //AIRLOCK_AUTH
    private auth = environment.AIRLOCK_API_AUTH;

    constructor(private authService: AuthenticationService, private router: Router, private airlockService: AirlockService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.auth != "TRUE") {
            return true;
        }
        let url: string = state.url;

        if (!this.checkLogin(url)) {
            var str = window.location.href;
            var ind = str.lastIndexOf("#");
            var prefix = str.substring(0, ind);
            window.location.href = prefix + 'auth/login';
            return false;
        } else {
            return true;
        }
    }

    checkLogin(url: string): boolean {

        return this.airlockService.isHaveJWTToken();
        // TODO: check if JWT exists. If yes return true, otherwise false + redirect to OKTA.

        //  If yes then return true
        //  If not, save url in session, redirect and then catch the redirection again with the guard

        // if (this.authService.isLoggedIn) { return true; }
        //
        // // Store the attempted URL for redirecting
        // this.authService.redirectUrl = url;
        //
        // // Navigate to the login page with extras
        // //this.router.navigate(['/login']);
        //
        // window.location.href = '/auth/login';

        // return true;
    }
}
