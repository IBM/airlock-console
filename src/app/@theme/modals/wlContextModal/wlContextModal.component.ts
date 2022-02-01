import {Component, ElementRef, EventEmitter, Inject, Input, NgZone, Output, ViewChild} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {Season} from "../../../model/season";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {Analytic} from "../../../model/analytic";
import {Branch} from "../../../model/branch";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {ConfirmActionModal} from "../confirmActionModal";
import {TreeviewItem} from "ngx-treeview";


@Component({
    selector: 'wl-context-modal',
    styleUrls: ['./wlContextModal.scss'],
    templateUrl: './wlContextModal.html',
})

export class wlContextModal {

    @ViewChild('plainVersion') plainVersion: ElementRef;
    @Output() outputEventWhiteListUpdate: EventEmitter<any> = new EventEmitter();
    @Input() totalCount: number;
    @Input() totalCountDev: number;
    @Input() totalCountQuota: number;
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
    loaded = false;
    isOpen: boolean = false;
    inputSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    season: Season;
    branch: Branch;
    ruleInputSchemaSample: string;
    analyticData: Analytic;
    seasonId: string;
    branchId: string;
    contextTree: TreeviewItem[];
    config = {
        hasAllCheckBox: false,
        hasFilter: false,
        hasCollapseExpand: false,
        decoupleChildFromParent: false,
        maxHeight: 500
    }
    selectedInputFields: any[];
    selectedInputFieldsCopy: any[];
    whiteListData: string[];
    numSelectedFields: number;
    numSelectedFieldOnServer: number;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private authorizationService: AuthorizationService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<wlContextModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.loading = false;
        this.title = this.getString("add_context_to_whitelist_title");
        this.isOpen = true;
        this.displayWhiteListABModal();
        this.numSelectedFields = this.analyticData.analyticsDataCollection.inputFieldsForAnalytics.length;
        this.numSelectedFieldOnServer = this.analyticData.analyticsDataCollection.inputFieldsForAnalytics.length;
    }

    initAfterClose() {

    }

    save() {
        this.promptSaveContextFields();
    }

    _save() {
        this.loading = true;
        this.analyticData.analyticsDataCollection.inputFieldsForAnalytics = [];// this.whiteListData;
        for (const i in this.whiteListData) {
            const strInputField = this.whiteListData[i].replace(/\.(\d+)/, '[$1]');
            this.analyticData.analyticsDataCollection.inputFieldsForAnalytics.push(strInputField);
        }
        console.log('inputFieldsForAnalytics:', this.analyticData.analyticsDataCollection.inputFieldsForAnalytics);
        console.log('seasonID:', this.seasonId);
        this._airLockService.updateAnalyticsGlobalDataCollection(this.seasonId, this.branchId, this.analyticData).then(() => {
            this.loading = false;
            this.outputEventWhiteListUpdate.emit(this.season);
            this.close();
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    promptSaveContextFields() {
        let message = this.numSelectedFields + this.getString("analytics_summary_context_warning");
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this._save();
            }
        });
    }

    handleError(error: any, title: string = "Save Failed") {
        this.loading = false;
        if (error == null) {
            return;
        }

        let errorMessage = error._body || "Request failed, try again later.";

        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
        }
        console.log("handleError in editFeatureModal:" + errorMessage);
        console.log(error);
        // this.create(title,errorMessage);
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                shouldDisplaySubmit: false,
                title: title,
                message: errorMessage,
                defaultTitle: 'OK'
            }
        })
    }

    close() {
        this.isOpen = false;
        this.inputSchemaString = "";
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modalRef.close();
    }

    showRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.lal9wm6w3zm7');
    }

    create(title: string, message: string) {
        this.toastrService.danger(message, title, {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

    displayWhiteListABModal() {
        // var inputFields: any;
        console.log('ruleInputSchemaSample for AB:', this.ruleInputSchemaSample);
        console.log('analyticData:', this.analyticData);
        let contextObj: {};
        this.selectedInputFields = [];
        this.selectedInputFieldsCopy = [];
        cleanFromEmptyObjects(this.ruleInputSchemaSample);
        const inputFields: any = new Set();
        for (let i in this.analyticData.analyticsDataCollection.inputFieldsForAnalytics) {
            let strInputField = this.analyticData.analyticsDataCollection.inputFieldsForAnalytics[i];
            strInputField = strInputField.replace('[', '.');
                    strInputField = strInputField.replace(']', '');
                    inputFields.add(strInputField);
        }
        contextObj = transform(this.ruleInputSchemaSample, "", inputFields);
        recursiveIteration(contextObj, "");
        console.log('contextObj:', contextObj);
        const obj = {};
        obj["data"] = contextObj;
        this.contextTree = obj["data"];
        this.whiteListData = [];

        this.selectedInputFieldsCopy = this.selectedInputFields.map(a => Object.assign({}, a));

        //expand first level
        if (this.contextTree[0]) {
            this.contextTree[0].setCollapsedRecursive(true);
            this.contextTree[0].collapsed = false;
        }

        //////////////////
        //inner functions
        //////////////////
        function transform(treeItem, pathToRoot, inputFieldsForAnalytics: Set<string>) {
            if (treeItem && typeof treeItem === 'object' && Object.keys(treeItem).length != 0) {
                return Object.keys(treeItem).map(function (k) {
                    let newPath = pathToRoot;
                    if (pathToRoot === ""){
                        newPath = k;
                    }else{
                        newPath = pathToRoot + '.' + k;
                    }
                    const children = transform(treeItem[k], newPath, inputFieldsForAnalytics);
                    if (children && children.length > 0) {
                        return new TreeviewItem({text: k, value: newPath, checked: inputFieldsForAnalytics.has(newPath),children: children});
                    } else {
                        return new TreeviewItem({
                            text: k,
                            value: newPath,
                            checked: inputFieldsForAnalytics.has(newPath)
                        });
                    }
                });
            }
        }

        function recursiveIteration(object, fullPath) {
            for (let property in object) {
                if (object.hasOwnProperty(property)) {
                    if (typeof object[property] == "object") {
                        recursiveIteration(object[property], fullPath);
                    } else {
                        if (property === "label") {
                            if (fullPath === "")
                                fullPath = object[property];
                            else
                                fullPath = fullPath + '.' + object[property];
                            object["value"] = fullPath;
                        }
                    }
                }
            }
        }

        function cleanFromEmptyObjects(object) {
            for (let property in object) {
                if (object.hasOwnProperty(property) && object[property]) {
                    if (object[property] && typeof object[property] == "object") {
                        if (Object.keys(object[property]).length === 0) {
                            //console.log('empty object');
                            delete object[property];
                        }
                        cleanFromEmptyObjects(object[property]);
                    }
                }
            }
        }
    }

    expandAll() {
        this.contextTree.forEach(node => {
            this.expandRecursive(node, true);
        });
    }

    private expandRecursive(node: any, isExpand: boolean) {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach(childNode => {
                this.expandRecursive(childNode, isExpand);
            });
        }
    }
}



