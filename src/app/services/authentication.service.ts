/**
 * Created by yoavmac on 14/09/2016.
 */

import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { User } from '../model/user';

@Injectable()
export class AuthenticationService {

    constructor(private http: Http) { }

    oktaGetUser (errorHandler:any = this.handleError) {

        // let url = '/auth/user';
        //
        // return this.http.get(url)
        //     .map(this.extractData)
        //     .catch(errorHandler);

        let url = '/auth/user';

        return this.http.get(url)
            .toPromise()
            .then(response => response.json() as User)
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

    private extractData(res: Response) {

        let body = res.json();
        return body.data || { };
    }

    private handleError(error: any) {

        let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}