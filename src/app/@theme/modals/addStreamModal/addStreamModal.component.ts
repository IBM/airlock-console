import {Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Stream} from "../../../model/stream";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
//
import {StringsService} from "../../../services/strings.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {StreamsPage} from "../../../pages/streams/streams.component";


@Component({
    selector: 'add-stream-modal',
    styleUrls: ['./addStreamModal.scss'],
    templateUrl: './addStreamModal.html',
    encapsulation: ViewEncapsulation.None
})

export class AddStreamModal {
    streamsPage: StreamsPage = null;
    seasonId: string;
    possibleGroupsList: Array<any> = ['1', '2'];
    title: string = "Add Stream";
    loading: boolean = false;
    private isShow: boolean = true;
    _stream: Stream;
    @Output() onStreamAdded = new EventEmitter();

    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                private modalRef: NbDialogRef<AddStreamModal>) {
        this.loading = true;
        this.seasonId = _appState.getCurrentSeason();
        this.possibleGroupsList = _appState.getAvailableGroups();
        this.initStream();
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initStream() {
        this._stream = new Stream();
        this._stream.filter = "false";
        this._stream.description = "";
        this._stream.processor = "false";
        this._stream.minAppVersion = "";
        this._stream.queueSizeKB = 2048;
        this._stream.maxQueuedEvents = null;
        this._stream.rolloutPercentage = 100;
        this._stream.stage = "DEVELOPMENT";
        this._stream.resultsSchema = "{}";
        this._stream.enabled = false;
        this._stream.internalUserGroups = [];
        this._stream.creator = this._airLockService.getUserName();
        this.loading = false;
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._stream.name == null || this._stream.name.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._stream.name = this._stream.name.trim();
            this.loading = true;
            this._airLockService.createStream(this.seasonId, this._stream).then(
                result => {
                    this.loading = false;
                    console.log(result)
                    this.onStreamAdded.emit(result);
                    this.close(result)
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New Stream added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Stream name is required.')
        }
    }

    // openModal(template: TemplateRef<any>) {
    //     this.modalRef = this.modalService.show(template);
    // }

    // open(template: TemplateRef<any>) {
    //     this.initStream();
    //     this.title = "Add Stream";
    //
    //     this.modalRef = this.modalService.show(template);
    //     // this.openWithoutClean();
    // }

    openWithoutClean() {

        // //this.parentId=parentId;
        // var $exampleMulti = $$(".js_example").select2(
        //     {
        //         tags: true,
        //         tokenSeparators: [',', ' ']
        //     }
        // );
        // console.log("internalGroups");
        // console.log(this._stream.internalUserGroups);
        //
        // $$('.js_example').on(
        //     'change',
        //     (e) => {
        //         this._stream.internalUserGroups = e.target as any;
        //     }
        // );
        // $exampleMulti.val(this._stream.internalUserGroups).trigger("change");
        // if (this.modal != null) {
        //     this.modal.open('md');
        // }
        // this.modalRef = this.modalService.show(template)
    }

    // openModalWithClass(template: TemplateRef<any>) {
    //     this.modalRef = this.modalService.show(
    //         template,
    //         Object.assign({}, {class: 'gray modal-lg'})
    //     );
    // }


    close(stream = null) {
        // this.modal.close();
        this.modalRef.close(stream);
    }

    ngOnInit() {
        console.log("possibleGroupsList" + this.possibleGroupsList);
        console.log("season" + this.seasonId);
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create Stream. Please try again.";
        console.log("handleError in addStreamModal:" + errorMessage);
        this.create(errorMessage);
    }

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
    ngxValue: any;

    create(message: string) {
        this.toastrService.danger(message, "Stream creation failed", {
            duration: 30000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            destroyByClick: true,
            hasIcon: false,
            toastClass: 'big-toast'
        });
    }



    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }
}

