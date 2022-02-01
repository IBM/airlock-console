/**
 * Created by yoavmac on 14/09/2016.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';

import {Observable} from 'rxjs';

import {User} from '../model/user';

@Injectable()
export class AuthenticationService {

    constructor(private http: HttpClient) {
    }

    oktaGetUser(errorHandler: any = this.handleError) {

        // let url = '/auth/user';
        //
        // return this.http.get(url)
        //     .map(this.extractData)
        //     .catch(errorHandler);

        let url = '/auth/user';

        return this.http.get(url)
            .toPromise()
            .then(response => (response as any).json() as User)
            .catch(errorHandler);
    }

    // oktaIsLoggedIn (errorHandler:any = this.handleError) : Observable<User> {
    //
    //     // The logged in method will return a User object if logged in or 0 if not
    //
    //     let url = '/auth/loggedIn';
    //
    //     return this.http.get(url)
    //         .map(this.extractData)
    //         .catch(errorHandler);
    // }

    private extractData(res: HttpResponse<any>) {

        let body = res as any;
        return body.data || {};
    }

    private handleError(error: any) {

        let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
