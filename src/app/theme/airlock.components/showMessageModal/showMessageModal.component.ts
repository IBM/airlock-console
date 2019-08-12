
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {Feature} from "../../../model/feature";


@Component({
    selector: 'show-message-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./showMessageModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent],
    template: require('./showMessageModal.html'),
})

export class ShowMessageModal {

    @ViewChild('showMessageModal') modal: ModalComponent;
    @Output() onClose= new EventEmitter<any>();
    loading: boolean = false;
    featureString: string = "";
    private title:string = "";
    private message:string = "";

    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService) {
    }

    open(title:string = "Are you sure you want to perform this action?",message:string="") {
        this.title=title;
        this.message=message;
        if (this.modal){
            this.modal.open();
        }
    }

    close(){
        this.onClose.emit(null);
        this.modal.close();
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


    //////////////////////////////////////////
}

