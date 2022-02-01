import {Component, OnDestroy} from '@angular/core';


import {StringsService} from "../../../services/strings.service";

import {GlobalState} from "../../../global.state";
import {NbMenuService} from "@nebular/theme";
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'ba-content-top',
    styleUrls: ['./baContentTop.scss'],
    templateUrl: './baContentTop.html',
})
export class BaContentTop implements OnDestroy{

    public activePageTitle: string = '';
    public activePageSubTitle: string = '';

    private destroy$ = new Subject<void>();

    constructor(private _state: GlobalState, private _stringsSrevice: StringsService, private menuService: NbMenuService) {
        // console.log("BaContentTop cstr");
        // var activeLink = this._state.getStringFromLocalStorage('menu.activeLink');
        // console.log("activeLink");
        // console.log(activeLink);
        // if (activeLink) {
        //     let activeTitle = this.getString(activeLink + "_title");
        //     if (activeTitle == "") {
        //         activeTitle = activeLink;
        //     }
        //     console.log("activeLink setvalue");
        //     this.activePageTitle = activeTitle;
        //     this.activePageSubTitle = this.getString(activeLink);
        //     console.log(this.activePageTitle);
        //     console.log(this.activePageSubTitle);
        // }
        // this._state.subscribe('menu.activeLink', 'batop', (activeLinkCallback) => {
        //     console.log("BaContentTop in subscribe");
        //     if (activeLink) {
        //         console.log("activeLink!");
        //         console.log(activeLink);
        //         let activeTitle = this.getString((activeLink as any).title + "_title");
        //         if (activeTitle == "") {
        //             activeTitle = (activeLink as any).title;
        //         }
        //         this.activePageTitle = activeTitle;
        //         this.activePageSubTitle = this.getString((activeLink as any).title);
        //     }
        // });
    }

    // getString(name: string) {
    //     console.log("getString:" + name)
    //     return this._stringsSrevice.getString(name);
    // }

    getActivePageTitle(){
        this.menuService.getSelectedItem('sideMenu')
            .pipe(takeUntil(this.destroy$))
            .subscribe( (menuBag) => {
                this.activePageTitle = menuBag.item?.title;
            });
        return this.activePageTitle;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
