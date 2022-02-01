import {Component} from '@angular/core';
import {MENU_ITEMS} from './pages-menu';
import {AirlockService} from "../services/airlock.service";
import {GlobalState} from "../global.state";
import {NbMenuItem} from "@nebular/theme";
import {Product} from "../model/product";

@Component({
    selector: 'pages',
    styleUrls: ['pages.component.scss'],
    template: `
        <ngx-one-column-layout>
          <nb-menu tag="sideMenu" [items]="menu"></nb-menu>
          <router-outlet>
            <ba-content-top></ba-content-top>
          </router-outlet>
        </ngx-one-column-layout>
    `,
})
export class PagesComponent {
    constructor(private _state: GlobalState,
                private _airlockService: AirlockService) {

        this._state.subscribe('app.height', 'PagesComponent', (isHigh) => {
            this.menu = MENU_ITEMS;
            this.menu[this.menu.length-1].hidden = !isHigh;
        });

        this._state.subscribe('features.currentProduct', 'PagesComponent', (productItem) => {
            let product = productItem as Product;
            this.menu = MENU_ITEMS;
            for (let i = 0; i < this.menu.length; i++ ){
                var menuItem = this.menu[i];
                switch (menuItem.title){
                    case 'Features' :
                        menuItem.hidden = !product.capabilities.includes("FEATURES");
                        break;
                    case 'Experiments' :
                        menuItem.hidden = !product.capabilities.includes("EXPERIMENTS");
                        break;
                    case 'Streams' :
                        menuItem.hidden = !product.capabilities.includes("STREAMS");
                        break;
                    case 'Notifications' :
                        menuItem.hidden = !product.capabilities.includes("NOTIFICATIONS");
                        break;
                    case 'Polls' :
                        menuItem.hidden = !product.capabilities.includes("POLLS");
                        break;
                    case 'Translations' :
                        menuItem.hidden = !product.capabilities.includes("TRANSLATIONS");
                        break;
                    case 'Entitlements' :
                        menuItem.hidden = !product.capabilities.includes("ENTITLEMENTS");
                        break;
                    case 'Airlytics' :
                        menuItem.hidden = !product.capabilities.includes("COHORTS") && !product.capabilities.includes("DATA_IMPORT");
                        for (let item of menuItem.children){
                            switch (item.title){
                                case 'Cohorts' :
                                    item.hidden = !product.capabilities.includes("COHORTS");
                                    break;
                                case 'Data import' :
                                    item.hidden = !product.capabilities.includes("DATA_IMPORT");
                                    break;
                            }
                        }
                        break;
                }
            }
        });

        this._state.subscribe('products', 'PagesComponent', (products) => {
            console.log("this._state.subscribe('products')");
            this.menu = MENU_ITEMS;
            for (let i = 0; i < this.menu.length; i++ ) {
                var menuItem = this.menu[i];
                switch (menuItem.title) {
                    case 'Administration' :
                        for (let item of menuItem.children){
                            switch (item.title){
                                case 'Webhooks' :
                                    item.hidden = !this._airlockService.isAdministrator();
                                    break;
                                case 'Authorization' :
                                    item.hidden = !this._airlockService.getHasAdminProds();
                                    break;
                            }
                        }
                        break;
                }
            }
        });
    }
    
    menu = MENU_ITEMS;
}
