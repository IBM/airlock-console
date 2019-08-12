import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {CreateIssueModal} from "../createIssueModal/createIssueModal.component";
import {NotificationsService} from "angular2-notifications";



@Component({
    selector: 'string-issue-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./stringIssueModal.scss')],
    template: require('./stringIssueModal.html'),
})

export class StringIssueModal {
    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('createIssueModal')
    createIssueModal: CreateIssueModal;
    title:string = "String Issues";
    loading: boolean = false;
    @Output() onAddComment= new EventEmitter<any>();
    @Input() seasonId: string;
    private stringsMap = {"TRANSLATION":"Translation","SOURCE":"Source","POOR_TRANSLATION":"Poor translation","DOES_NOT_FIT_SPACE":"Does not fit space",
        "PLACEHOLDER_ISSUE":"Placeholder issue","CLARIFICATION":"Clarification","MISSPELLING":"Misspelling","REVIEW_TRANSLATION":"Review translation","OPENED":"Opened","RESOLVED":"Resolved"};

    private isTranslation: boolean;
    private stringId: string;
    private locale: string;
    private issues;
    private comments: any[];
    private newComment: string;
    private newIssueText: string;
    private newIssueSubType: string;
    private issueSubTypeCode: string;//"DOES_NOT_FIT_SPACE"
    private issueText: string;
    private createdDate: string;//"2017-06-07T09:20:04Z"
    private issueStateCode: string//"RESOLVED",
    //"issueTextModifiedDate":
    private issueTypeCode: string; // "TRANSLATION",
    private currentIssueId: string;
    private currentIssueIndex: number;
    private currentIssueIndexReversed: number;

    private key:string = "";
    private value:string = "";
    private stage:string = "DEVELOPMENT";
    private fallback:string = "";
    private translationInstruction:string = "";
    private maxStringSize:string = null;
    constructor(private _airLockService:AirlockService,
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService, private toastrService: ToastrService) {
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initIssue(){
        this.comments = null;
        this.loading = false;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    isPositiveInteger(str) {
        return /^[1-9]\d*$/.test(str);
    }

    clean(){
        this.currentIssueId = null;
        this.issues = null;
        this.currentIssueIndex = -1;
    }

    addNewComment(){
        if(this.newComment != null && this.newComment.replace(/\s/g, '') != ""){
            var newCommentJson = {};
            newCommentJson["comment"] = this._airLockService.getUserName() + ": " + this.newComment;
            this.loading = true;
            this._airLockService.addStringIssueComment(this.seasonId,this.currentIssueId,newCommentJson).then(() => {
                this.loading = false;
                this.newComment = null;
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Comment Added"});
                this.getIssues(false);
            }).catch(
                error => {
                    this.loading = false;
                    console.log(`Failed to add comment: ${error}`);
                    this.handleError(error,"Failed to add comment");
                }
            );
        }
    }

    changeState(isOpen: boolean){
        this.loading = true;
        this._airLockService.changeIssueState(this.seasonId,this.currentIssueId,!isOpen).then(() => {
            this.loading = false;
            if(isOpen){
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Issue resolved"});
            }
            else{
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Issue reopened"});
            }
            this.getIssues(false);
        }).catch(
            error => {
                this.loading = false;
                if(isOpen){
                    console.log(`Failed to resolve issue: ${error}`);
                    this.handleError(error,"Failed to resolve issue");
                }
                else{
                    console.log(`Failed to reopen issue: ${error}`);
                    this.handleError(error,"Failed to reopen issue");
                }
            }
        );

    }

    newIssueAdded(newIssueId){
        //this.issueIds.push(newIssueId);
        //this.currentIssueId = newIssueId;
        if(this.issues != null){
            this.currentIssueIndex = this.issues.issues.length;
        }
        else{
            this.currentIssueIndex = 0;
        }
        this.currentIssueIndexReversed = 0;
        this.getIssues(false);
    }

    createIssue(){
        this.createIssueModal.open(this.stringId, this.locale, this.isTranslation);
    }

    open(stringId: string, locale: string,issueStatus: string,key:string = "",isTranslation: boolean){
        this.isTranslation = isTranslation;
        this.stringId = stringId;
        this.locale = locale;
        this.key = key;
        this.newComment = null;
        this.issueTypeCode = isTranslation? "TRANSLATION" : "SOURCE";
        this.clean();
        if(issueStatus != "NO_ISSUES") {
            this.loading = true;
            this._airLockService.getStringIssue(this.stringId, this.locale).then(res => {
                this.issues = res;
                this.currentIssueIndex = res.issues.length - 1;
                this.currentIssueIndexReversed = 0;
                this.loadCurrentIssue();
                this.loading = false;
                if (this.modal != null) {
                    this.modal.open();
                }
            }).catch(
                error => {
                    this.loading = false;
                    console.log(`Failed to get string Issue: ${error}`);
                    this.handleError(error, "Failed to get string Issue");
                }
            );
        }
        else{
            if (this.modal != null) {
                this.modal.open();
            }
        }
    }

    changeIssue(i){
        this.currentIssueIndexReversed = i;
        this.currentIssueIndex = this.issues.issues.length-1 - this.currentIssueIndexReversed;
        this.loadCurrentIssue();
    }

    loadCurrentIssue(){
        this.comments = this.issues.issues[this.currentIssueIndex]["items"];
        this.issueSubTypeCode = this.issues.issues[this.currentIssueIndex]["issueSubTypeCode"];
        this.issueStateCode = this.issues.issues[this.currentIssueIndex]["issueStateCode"];
        this.issueTypeCode = this.issues.issues[this.currentIssueIndex]["issueTypeCode"];
        this.issueText = this.issues.issues[this.currentIssueIndex]["issueText"];
        this.createdDate = this.issues.issues[this.currentIssueIndex]["createdDate"];
        this.currentIssueId = this.issues.issues[this.currentIssueIndex].issueUid;
    }

    getIssues(openModal: boolean){
        this.loading = true;
        this._airLockService.getStringIssue(this.stringId,this.locale).then(res => {
            this.issues = res;
            //this.currentIssueIndex = res.issues.length-1;
            //this.currentIssueIndexReversed = 0;
            this.loadCurrentIssue();
            this.loading = false;
            if(openModal){
                if(this.modal != null) {
                    this.modal.open();
                }
            }
        }).catch(
            error => {
                this.loading = false;
                console.log(`Failed to get string Issues: ${error}`);
                this.handleError(error,"Failed to get string Issues");
            }
        );
    }

    // createNewIssue(){
    //     this.loading = true;
    //     this._airLockService.createNewStringIssue(this.stringId,this.locale,this.newIssueText,this.issueTypeCode,this.newIssueSubType).then(res => {
    //         this.loading = false;
    //         this.currentIssueId = res["uniqueId"];
    //         this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Issue created"});
    //         this.currentIssueIndex = res.issues.length;
    //         this.currentIssueIndexReversed = 0;
    //         this.getIssues(false);
    //     }).catch(
    //         error => {
    //         this.loading = false;
    //         console.log(`Failed to create string Issue: ${error}`);
    //         this.handleError(error,"Failed to create string Issue");
    //     }
    //     );
    // }

    close(){
        this.modal.close();
    }

    handleError(error: any,title: string) {
        this.loading = false;
        let errorMessage = error._body || "Failed to create issue. Please try again.";
        console.log("handleError in stringIssueModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        this.create(errorMessage,title);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

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

