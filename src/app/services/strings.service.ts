import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {globalStrings} from "./strings";
/**
 * Created by elikk on 26/09/2016.
 */
@Injectable()
export class StringsService {
    strings: any;
    constructor(private http: Http) {
        this.strings = globalStrings;
    }

    getString(name:string) {
        let str = this.strings[name];
        if (!str) str = "";
        return str;
    }

    getStringWithFormat(name:string, ...format:string[]){

        let str = this.getString(name);

        return str.replace(/{(\d+)}/g, function(match, number) {
            return typeof format[number] != 'undefined'
                ? format[number]
                : match
                ;
        })
    }
}