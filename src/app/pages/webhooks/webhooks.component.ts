import {Component, Injectable, trigger, state, transition, animate, style, ElementRef} from '@angular/core';
import {AirlockService} from "../../services/airlock.service";
import {Season} from "../../model/season";
import {ViewChild} from "@angular/core";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {GlobalState} from "../../global.state";
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {StringsService} from "../../services/strings.service";
import {Product} from "../../model/product";
import {User} from "../../model/user";
import {Role} from "../../model/role";
import {AddUserModal} from "../../theme/airlock.components/addUserModal";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {Webhook} from "../../model/webhook";
import {AddNotificationModal} from "../../theme/airlock.components/addNotificationModal/addNotificationModal.component";
import {AddWebhookModal} from "../../theme/airlock.components/addWebhookModal";

@Component({
    selector: 'webhooks',
    providers: [TransparentSpinner,FeatureUtilsService],
    styles: [require('./webhooks.scss')],
    template: require('./webhooks.html'),
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})


export class WebhooksPage {
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;
    @ViewChild('addWebhookModal')
    addWebhookModal:  AddWebhookModal;
    valid: boolean = true;
    webhooks: Webhook[];
    filteredItems: Array<string> = new Array<string>();
    selectedId = null;
    selectedIndex = -1;
    public sortBy;
    data;
    public sortOrder = "asc";
    scrolledToSelected = false;
    filterlistDict: {string: Array<string>} = {string:[]};
    editDialogOpen: boolean = false;
    loading: boolean = false;
    showDialog = false;
    filteredUsers: Array<User> = new Array<User>();
    searchQueryString: string = null;
    allProductsProd: Product;

    public status: {isopen: boolean} = {isopen: false};
    constructor(private _airLockService:AirlockService,
                private _appState: GlobalState, private _stringsSrevice: StringsService,
                public modal: Modal) {
        this.allProductsProd = new Product();
        this.allProductsProd.name = "Default for new products";
        this.allProductsProd.uniqueId = null;
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    addWebhook() {
        let prods = this._appState.getData('products');
        this.addWebhookModal.open(prods);
    }

    isShowOptions(){
        return (!this._airLockService.isViewer());
    }
    isViewer():boolean {
        return this._airLockService.isViewer();
    }


    toggleDataCollectionDetails(){
        this.showDialog = !this.showDialog;
    }
    initData() {
        this.loading = true;
        this._airLockService.getWebhooks().then((webhooks) => {
            this.webhooks = webhooks;
            console.log(webhooks)
            this.loading = false;
        }).catch(error => {
            this.loading = false;
            this._airLockService.notifyDataChanged("error-notification",`Failed to load webhooks: ${error}`);
        });
    }

    ngOnInit() {
        this.initData();
        // this.initProductList();
    }
    ngOnDestroy() {

    }


    getProductFromID(prodId: string, products: Product[]): Product {
        for (let prod of products || []) {
            if (prod.uniqueId === prodId) {
                return prod;
            }
        }
        return null;
    }

    isCellOpen(expID:string): boolean {
        return false;
        // var index = this.openExperiments.indexOf(expID, 0);
        // return index > -1;
    }

    setShowConfig(show:boolean) {
        // this.showConfig = show;
        // if (show) {
        //     this.filterlistDict["type"] = [];
        // } else {
        //     this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        // }

    }


    webhookIsInFilter(event) {}
    webhookChangedStatus(event) {}
    public refreshTable() {
        // this.selectProduct(this.selectedProduct);
        this.initData();
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }
    public onSearchQueryChanged(term:string) {
        this.loading = true;
        setTimeout(() => {
            this.filteredItems = [];
            this.searchQueryString = term;
            this.createFilteredList();
            this.loading = false;
        }, 100);
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    createFilteredList() {
        this.filteredItems = [];
        this.selectedId = null;
        this.scrolledToSelected = false;
        this.selectedIndex = -1;
        let term = this.searchQueryString;
        let items = [];
        if (term && term.length > 0 && this.webhooks) {
            for (var webhook of this.webhooks) {
                if (this.isPartOfSearch(term, webhook)) {
                    items.push(webhook.uniqueId);
                }
            }
            this.filteredItems = items;
        }

    }
    getNumItems() {
        if (this.filteredItems && this.searchQueryString && this.searchQueryString.length > 0) {
            return this.filteredItems.length;
        }
        return 0;
    }
    _stringIncludes(str:string, term:string) {
        if (!str) {
            return false;
        }
        if (!term) {
            return true;
        }
        return (str.toLowerCase().indexOf(term.toLowerCase()) > -1);
    }

    isPartOfSearch(term:string, webhook:Webhook):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = webhook.name ? webhook.name : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = webhook.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    showNextSearchResult(forward:boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length-1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length-1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    itemIsSelected(itemObj:any) {
        if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
            let y = itemObj.offset;
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    }

    checkIfInView(top: number){
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if(offset > window.innerHeight  || offset < 0){
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top-200;
                return false;
            }
        }
        return true;
    }

}

