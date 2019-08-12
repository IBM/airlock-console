/**
 * Created by yoavmac on 18/08/2016.
 */

import {Component, ViewEncapsulation, Injectable, OnInit} from '@angular/core';
import {Input, Output, EventEmitter} from '@angular/core';
import {Product} from "../../../../model/product";
import { AirlockService } from '../../../../services/airlock.service'
import {StringsService} from "../../../../services/strings.service";

@Component({
    selector: 'product-list',
    styles: [require('./product-list.scss')],
    template: require('./product-list.html')
})
export class ProductList {

    loading: boolean = false;
    @Input() _products          : Product[] = [];
    @Input() _selectedProduct   : Product   = null;
    @Output() onProductSelectionChanged = new EventEmitter();

    constructor(private _airlockService : AirlockService,private _stringsSrevice: StringsService) {
    }

    onSelect(product : Product) {
        //this._selectedProduct = product;
        this.onProductSelectionChanged.emit(product);
    }

    getProductFollowTooltip(isfollowed: boolean){
        if(!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");
        if(isfollowed){
            return this.getString('notifications_unfollow_tooltip');
        }
        else{
            return this.getString('notifications_follow_tooltip');
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format:string[]) {
        return this._stringsSrevice.getStringWithFormat(name,...format);
    }

    starClicked(event,product : Product){
        console.log("star-clicked");
        if(event) {
            event.stopPropagation();
        }
        if(!this._airlockService.isHaveJWTToken())
            return;
        if (product.isCurrentUserFollower){
            this.loading = true;
            this._airlockService.unfollowProduct(product.uniqueId)
                .then(response  => {
                    console.log(response);
                    product.isCurrentUserFollower = false;
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_unfollow_product_success",product.name)});
                })
                .catch(error => {
                    this.loading = false;
                    console.log('Error in unfollow product');
                    this._airlockService.notifyDataChanged("error-notification", this.getString("notifications_unfollow_product_error"));
                });
        }
        else{
            this.loading = true;
            this._airlockService.followProduct(product.uniqueId)
                .then(response  => {
                    console.log(response);
                    product.isCurrentUserFollower = true;
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_follow_product_success",product.name)});
                })
                .catch(error => {
                    this.loading = false;
                    console.log('Error in follow product');
                    this._airlockService.notifyDataChanged("error-notification", this.getString("notifications_follow_product_error"));
                });
        }
    }
}
