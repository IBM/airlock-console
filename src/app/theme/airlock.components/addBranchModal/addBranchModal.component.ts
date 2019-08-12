
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import {  ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {Branch} from "../../../model/branch";


@Component({
    selector: 'add-branch-modal',
    styles: [require('./addBranchModal.scss')],
    template: require('./addBranchModal.html')

})

export class AddBranchModal {

    @ViewChild('addBranchModal') modal: ModalComponent;

    loading: boolean = false;
    loaded: boolean = false;
    _branch: Branch;
    _sourceBranch: Branch;
    _sources: Branch[];
    @Output() onBranchAdded = new EventEmitter<Branch>();

    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService
        , private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this._branch = new Branch();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(source:Branch, branches:Branch[]) {
        if (this.modal){
            this.removeAll();
            this._branch = new Branch();
            this._branch.seasonId = source.seasonId;
            this._sourceBranch = source;
            this._sources = branches;
            this._branch.creator = this._airLockService.getUserName();
            this.loaded = true;
            this.modal.open();
        }
    }

    save() {

        if (this.isValid()) {
            this.loading = true;
            this._airLockService.addBranch(this._branch,this._sourceBranch.uniqueId).
                then(
                    result => {
                        this.loading = false;
                        console.log(result);
                        this.onBranchAdded.emit(result);
                        this.close();
                        this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New branch added"});
                    }
                ).catch(
                    error => {
                        this.loading = false;
                        this.handleError(error);
                    }
                );

        } else {
            this.loading = false;
            this.create('Branch name is required.')
        }
    }

    isValid() : boolean {
        if (!this._branch)
            return false;

        return (this._branch.name.trim() !== '');
    }

    close(){
        this.loaded = false;
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to create branch. Please try again.");
        console.log("handleError in addBranchModal:"+errorMessage);
        console.log(error);
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
        this.toastrService.error(message, "Create branch failed", {
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

    getBranchesForSelect():any[] {
        var toRet = [];
        if (this._sources) {
            for (var branch of this._sources) {
                let seasonObj = {id:branch,
                    text:branch.name};
                toRet.push(seasonObj);
            }
        }
        return toRet;
    }

    selectBranchFromSelect(branchObj:any) {
        if (branchObj)  {
            if (branchObj.id && branchObj.id != this._sourceBranch) {
                this.selectBranch(branchObj.id);
            }

        }
    }

    selectBranch(branch:Branch) {
        this._sourceBranch = branch;
    }

    isInputWarningOn(fieldValue: string){
        if (fieldValue ===   undefined || fieldValue ===  null || fieldValue=="") {
            return true;
        }
        else
            return false;
    }



    //////////////////////////////////////////
}

