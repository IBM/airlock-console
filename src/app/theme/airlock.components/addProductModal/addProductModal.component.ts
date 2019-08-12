
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import {  ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";


@Component({
    selector: 'add-product-modal',
    styles: [require('./addProductModal.scss')],
    template: require('./addProductModal.html')

})

export class AddProductModal {

    @ViewChild('addProductModal') modal: ModalComponent;

    loading: boolean = false;
    _product: Product;
    @Output() onProductAdded = new EventEmitter();

    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService
        , private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this._product = new Product();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open() {
        if (this.modal){
            this.removeAll();
            this._product = new Product();
            this.modal.open();
        }
    }

    save() {

        if (this.isValid()) {
            this.loading = true;
            this._product.codeIdentifier =this._product.name.replace(/ /g,'');
            this._airLockService.addProduct(this._product).
                then(
                    result => {
                        this.loading = false;
                        console.log(result)
                        this.onProductAdded.emit(result);
                        this.close()
                        this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New product added"});
                    }
                ).catch(
                    error => {
                        this.handleError(error);
                    }
                );

        } else {
            this.loading = false;
            this.create('Product name is required.')
        }
    }

    isValid() : boolean {
        if (!this._product)
            return false;

        return (this._product.name.trim() !== '');
    }

    close(){
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = this._airLockService.parseErrorMessage(error,"Failed to add product. Please try again.");//error._body || "Failed to add product. Please try again.";
        // console.log("handleError in addProductModal:"+errorMessage);
        // console.log(error);
        // if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
        //     errorMessage = errorMessage.substring(1,errorMessage.length -1);
        // }
        this.create(errorMessage);
    }

    /////////////////////////////////////////
    //notifications stuff
    public options = {
        timeOut: 0,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: "visible",
        rtl: false,
        animate: "scale",
        position: ["right", "bottom"]
    };

    create(message:string) {
        this.toastrService.error(message, "Add product failed", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////
}

