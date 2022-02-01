import {Component, ElementRef, Inject, NgZone, ViewChild, ViewEncapsulation} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";


import {Season} from "../../../model/season";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {Utility} from "../../../model/utility";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {TabsetConfig} from "ngx-bootstrap/tabs";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {AceModal} from "../aceModal/aceModal.component";
import {AceExpandDialogType} from "../../../app.module";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {NbComponentSize} from "@nebular/theme/components/component-size";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";


export function getTabsetConfig(): TabsetConfig {
    return Object.assign(new TabsetConfig(), {type: 'pills'});
}

@Component({
    selector: 'edit-utility-modal',
    styleUrls: ['./editUtilityModal.scss'],
    templateUrl: './editUtilityModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditUtilityModal {
    // @ViewChild('editUtilityModal')
    // modal: ModalComponent;
    // @ViewChild('showMessageModal')
    // showMessageModal: ShowMessageModal;
    @ViewChild('paceInputSchemaModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild('plainVersion') plainVersion: ElementRef;
    // @ViewChildld('verifyActionModal')
    // verifyActionModal: VerifyActionModal;
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
    loading: boolean = false;
    private elementRef: ElementRef;
    utilitiesInput: Utility[]
    private isAddNewMode: boolean = false;
    type: string = "";
    loaded = false;
    isOpen: boolean = false;
    selectedIndex: number = 0;
    selectedUtility: Utility = null;
    selectedUtilityName = '';
    curUtilityString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    isDirty: boolean = false;
    title: string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "180px";
    season: Season;
    utilities:Utility[];
    utilitiesMAp: Map<String, number> = new Map();

    constructor(
        // private _spinner: BaThemeSpinner,
        private _airLockService: AirlockService,
        @Inject(ElementRef) elementRef: ElementRef,
        private _featureUtils: FeatureUtilsService,
        private authorizationService: AuthorizationService,
        private zone: NgZone,
        private _stringsSrevice: StringsService,
        private toastrService: NbToastrService,
        private _appState: GlobalState,
        protected modalRef: NbDialogRef<EditUtilityModal>,
        private modalService: NbDialogService) {
            this.elementRef = elementRef;
            this.season = this._appState.getCurrentSeason();
    }

    createNewUtil() {
        this.isAddNewMode = true;
        this.selectedUtility = new Utility();
        this.selectedUtility.seasonId = this.season.uniqueId;
        this.selectedUtility.type = this.type;
        this.curUtilityString = "//Enter new utility code and click Save";
        this.selectedUtility.utility = this.curUtilityString;
        this.selectedUtility.stage = "DEVELOPMENT";
        this.utilities.push(this.selectedUtility);
        this.utilitiesMAp.set(this.selectedUtility.name, this.utilitiesMAp.size)
        this.selectedIndex = this.utilities.length - 1;
        this.selectedUtility.name = "<New Utility>"
    }

    askIfToSaveDirty(newIndex: number) {
        let message = "Do you want to save '" + this.getUtilName(this.selectedIndex) + "'?";
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                feature: null,
                text: message,
                verifyModalDialogType: VerifyDialogType.STRING_TYPE,
                showDiscard: true,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed == 1) {
                this.selectedUtility.utility = this.curUtilityString;
                this.saveCurrentUtil(newIndex, this.utilities[this.utilities.length - 1], false);
            } else if (confirmed == 2){
                this.moveToUtility(newIndex);
            }
        });
    }

    reloadData(newSelectedIndex:number,newUtil:Utility = null){
        this.loading=true;
        this._airLockService.getUtilities(this.season.uniqueId)
            .then(response  => {
                this.isDirty = false;
                if(newUtil != null){
                    (response as any).push(newUtil);
                }
                this.loadData(response as any, newSelectedIndex);
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
                this._airLockService.notifyDataChanged("error-notification",`Failed to load utilities: ${error}`);
            });
    }

    deleteUtility() {
        let message = 'Are you sure want to delete this utility?';
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this._deleteUtility();
            }
        });
    }

    _deleteUtility() {
        this.loading = true;
        this._airLockService.deleteUtil(this.selectedUtility.uniqueId).then(result => {
            this.loading = false;
            // this.onEditFeature.emit(null);
            // this.close()
            this.reloadData(0);
            this._airLockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: this.getString("edit_utils_message_succuss_delete")
            });
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    changeUtilityStage() {
        if (this.selectedUtility.stage == "PRODUCTION") {
            this.selectedUtility.stage = "DEVELOPMENT";
        } else {
            this.selectedUtility.stage = "PRODUCTION";
        }
        this.loading = true;
        this._airLockService.updateUtil(this.selectedUtility).then(
            res => {
                this.loading = false;
                this.reloadData(this.selectedIndex);
                var message: string = ""
                if (this.selectedUtility.stage == "PRODUCTION") {
                    message = this.getString("edit_utils_message_succuss_move_to_prod");
                } else {
                    message = this.getString("edit_utils_message_succuss_move_to_dev");

                }
                this._airLockService.notifyDataChanged("success-notification", {title: "Success", message: message});
                // this.selectedUtility.lastModified = res.lastmodified;
            }
        ).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.loading = false;
        this.title = this.getString("edit_utils_title");
        this.isOpen = true;
        this.isDirty=false;
        this.isAddNewMode=false;
        this.loadData(null,0);
        if(this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                // this.modalRef.open('lg');
            });
        }
    }

    initAfterClose() {

    }

    canAddNewUtil() {
        return !this._airLockService.isViewer() && !this.isAddNewMode;
    }

    canSave() {
        if (this.selectedUtility == null && this.type != "STREAMS_UTILITY") {
            return false;
        }
        if (this.selectedUtility != null && this.selectedUtility.stage == "PRODUCTION") {
            return !(this._airLockService.isViewer() || this._airLockService.isEditor());
        }
        return !this._airLockService.isViewer();
    }

    canChangeStage() {
        return !(this._airLockService.isViewer() || this._airLockService.isEditor());
    }

    canDelete() {
        if (this.selectedUtility.stage == "PRODUCTION") {
            return false;
        }
        return !this._airLockService.isViewer();
    }

    saveCurrentUtil(moveToIndex: number, addNewUtil: Utility, closeAfter: boolean) {
        this._airLockService.updateUtil(this.selectedUtility).then(result => {
            this.loading = false;
            if (!closeAfter) {
                this.reloadData(moveToIndex, addNewUtil);
            }
            this._airLockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: this.getString("edit_utils_message_succuss_updated")
            });
            if (closeAfter) {
                this.close();
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    save() {
        if ((this.type != "STREAMS_UTILITY" && this.selectedUtility == null) || this.curUtilityString == null || this.curUtilityString.length == 0) {
            // this.showMessageModal.open("Error", "Save Failed -
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    shouldDisplaySubmit: false,
                    title: "Error",
                    message: "Save Failed - No utility code was entered.",
                    defaultTitle: 'OK'
                }
            })
            return;
        }

        this.loading = true;
        try {
            this.selectedUtility.utility = this.curUtilityString;
        } catch (e) {
            this.create("Error", "Utility is not valid");
            this.loading = false;
            return
        }
        if (!this.isAddNewMode) {
            this.saveCurrentUtil(this.selectedIndex, null, true);
        } else {
            this._airLockService.createUtil(this.selectedUtility).then(result => {
                this.loading = false;
                this.isAddNewMode = false;
                // this.reloadData(-1);
                this._airLockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: this.getString("edit_utils_message_succuss_added")
                });
                this.close();
            }).catch(error => {
                this.loading = false;
                this.handleError(error);
            });
        }
    }

    stringify(obj) {

        return JSON.stringify(obj, function (key, value) {
            var fnBody;
            if (value instanceof Function || typeof value == 'function') {
                fnBody = value.toString();
                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
            }
            return value;
        });
    };

    handleError(error: any, title: string = "Save Failed") {
        this.loading = false;
        if (error == null) {
            return;
        }

        var errorMessage = this._airLockService.parseErrorMessage(error, "Request failed, try again later.");
        console.log(error);
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                shouldDisplaySubmit: false,
                title: title,
                message: errorMessage,
                defaultTitle: 'OK'
            }
        })
        // this.showMessageModal.open(title, errorMessage);
    }

    close() {
        this.isOpen = false;
        this.curUtilityString = "";
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modalRef.close();
    }

    validate() {

    }

    changeStage() {
        let message = "";
        if (this.selectedUtility.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this utility \'' + this.getUtilName(this.selectedIndex) + '\' to development?';
            message += `\n This operation can impact your app in production.`;
        } else {
            message = 'Are you sure you want to release this utility \'' + this.getUtilName(this.selectedIndex) + '\' to production?';
            message += `\n This operation can impact your app in production.`;
        }
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this.changeUtilityStage();
            }
        });
    }

    openAceEditorOutputConfigurationExpand() {
        var expandDialogTitle = this.title;
        this.aceModalContainerDialog.showAceModal(this.curUtilityString, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, false);
    }

    showRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.j8q64v7skfdo');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    moveToUtility(index: number) {
        this.isDirty = false;
        this.selectedIndex = index;
        this.selectedUtility = new Utility(this.utilities[this.selectedIndex]);
        this.selectedUtility.name = this.getUtilName(this.selectedIndex);
        try {
            this.curUtilityString = this.selectedUtility.utility;
        } catch (e) {
            console.log(e);
        }
    }

    selectUtility(index: number) {
        var isChanged = this.isDirty;
        //update new util text
        if (this.isAddNewMode && this.selectedIndex == this.utilities.length - 1 && isChanged) {
            this.utilities[this.selectedIndex].utility = this.curUtilityString;
            this.moveToUtility(index);
        } else {
            if (isChanged) {
                this.askIfToSaveDirty(index);
            } else {
                this.moveToUtility(index);
            }
        }

    }

    selectUtilityByName(name: string) {
        this.selectUtility(this.utilitiesMAp.get(name))
    }

    markDirtyName() {
        this.isDirty = true;
    }

    loadData(utilities:Utility[], newSelectedIndex:number){
        //this.isAddNewMode = false;
        if (utilities !== null){
            this.utilities = (utilities == null)?[]:utilities.filter( util => util.type == this.type);
        }
        if(newSelectedIndex != -1) {
            this.selectedIndex = newSelectedIndex;
        }else{
            this.selectedIndex = this.utilities.length - 1;
        }
        if(this.utilities.length >0){
            this.selectedUtility = this.utilities[this.selectedIndex];
            this.selectedUtility.name = this.getUtilName(this.selectedIndex);
            try {
                this.curUtilityString = this.selectedUtility.utility;
            }catch (e){
                console.log(e);
            }
        }
        if(this.type == "STREAMS_UTILITY" && this.utilities.length == 0){
            this.selectedUtility = new Utility();
            this.selectedUtility.name = "StreamsUtils";
            this.selectedUtility.type = "STREAMS_UTILITY";
            this.selectedUtility.seasonId = this.season.uniqueId;
            this.selectedUtility.stage = "DEVELOPMENT";
            this.isAddNewMode=true;
            try {
                this.curUtilityString = this.selectedUtility.utility;
            }catch (e){
                console.log(e);
            }
        }

        if (this.utilities !== null) {
            for (var i = 0; i < this.utilities.length; i++) {
                this.utilities[i].name = this.getUtilName(i);
                this.utilitiesMAp.set(this.utilities[i].name, i)
            }
        }
    }

    getUtilName(index: number) {
        if (this.utilities[index].name) {
            return this.utilities[index].name;
        } else {
            return "Utility " + (index + 1);
        }
    }

    open(utilities: Utility[], season: Season, type: string) {
        this.loading = false;
        this.title = this.getString("edit_utils_title");
        this.isOpen = true;
        this.season = season;
        this.type=type;
        this.isDirty=false;
        this.isAddNewMode=false;
        //filter utils based on type since it returns all
        this.loadData(utilities,0);
        if(this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                // this.modalRef.open('lg');
            });
        }
    }

    isInNewUtil(): boolean {
        return (this.isAddNewMode && this.selectedIndex == this.utilities.length - 1);
    }

    curUtilityUpdatedExpanded(event) {
        this.curUtilityString = event;
        this.isDirty = true;

    }

    curUtilityUpdated(event) {
        let isChanged = event.diff;
        this.curUtilityString = event.value;
        if (isChanged) {
            this.isDirty = true;
        }
    }

    create(title: string, message: string) {
        this.toastrService.danger(message, title, {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    getSelectedUtilityName (){
        var prefix = '';
        if (this.isInNewUtil()){
            prefix ='*';
        }
        return prefix + this.selectedUtility.name
    }

    onCreate(event) {
    }

    onDestroy(event) {
    }
}



