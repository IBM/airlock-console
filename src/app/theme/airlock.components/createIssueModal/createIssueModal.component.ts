
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { AirlockService } from "../../../services/airlock.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService} from "angular2-notifications";
import {ToastrService} from "ngx-toastr";
import {EventEmitter} from "@angular/common/src/facade/async";

@Component({
    selector: 'create-issue-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./createIssueModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent],
    template: require('./createIssueModal.html'),
})

export class CreateIssueModal {

    @ViewChild('showConflictsModal') modal: ModalComponent;

    loading: boolean = false;
    private stringId: string;
    private locale: string;
    private newIssueText: string;
    private issueTypeCode: string;
    private newIssueSubType: string;
    private newIssueSubTypeText: string;
    private issueId: string;
    @Output() newIssueAdded= new EventEmitter<any>();

    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService, private toastrService: ToastrService) {
    }

    stripSpaces(s:string){
        if(!s){
            return "";
        }
        return s.replace(/\s/g, '');
    }

    clean(){
        this.newIssueText = "";
        this.newIssueSubType = "";
        this.newIssueSubTypeText = "Select type";
    }

    open(stringId: string, locale: string,isTranslation: boolean) {
        this.clean();
        this.stringId = stringId;
        this.locale = locale;
        this.issueTypeCode = isTranslation? "TRANSLATION" : "SOURCE";
        if (this.modal){
            this.modal.open();
        }
    }

    createNewIssue(){
        this.loading = true;
        this._airLockService.createNewStringIssue(this.stringId,this.locale,this.newIssueText,this.issueTypeCode,this.newIssueSubType).then(res => {
            this.loading = false;
            this.issueId = res["uniqueId"];
            this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Issue created"});
            this.newIssueAdded.emit(this.issueId);
            this.close();
        }).catch(
            error => {
                this.loading = false;
                console.log(`Failed to create string Issue: ${error}`);
                this.handleError(error,"Failed to create string Issue");
            }
        );
    }

    close(){
        this.modal.close();
    }

    handleError(error: any,title: string) {
        this.loading = false;
        let errorMessage = error._body || "Failed to create issue. Please try again.";
        console.log("handleError in CreateIssueModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        this.create(errorMessage,title);
    }

    create(message:string, title: string) {
        this.toastrService.error(message, title, {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
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

