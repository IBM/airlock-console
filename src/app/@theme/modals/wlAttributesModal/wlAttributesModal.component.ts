// import 'select2';
import {Component, ElementRef, EventEmitter, Inject, Input, NgZone, Output, ViewChild} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {Season} from "../../../model/season";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {Analytic, Attribute, DisplayAttribute, FeatureAnalyticAttributes} from "../../../model/analytic";
import {Feature} from "../../../model/feature";
import {Branch} from "../../../model/branch";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {ConfirmActionModal} from "../confirmActionModal";

@Component({
    selector: 'wl-attributes-modal',
    styleUrls: ['./wlAttributesModal.scss'],
    templateUrl: './wlAttributesModal.html',
})

export class wlAttributesModal {
    @Input() totalCount: number;
    @Input() totalCountDev: number;
    @Input() totalCountQuota: number;
    // @ViewChild('wlAttributesModal')
    // modal: ModalComponent;
    // @ViewChild('showMessageModal')
    // showMessageModal: ShowMessageModal;
    // @ViewChild('paceInputSchemaModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild('plainVersion') plainVersion: ElementRef;
    @Output() outputEventAnalyticsAttributesUpdate: EventEmitter<any> = new EventEmitter();
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
    referenceOpen: boolean = false;
    title: string;
    private season: Season;
    ruleInputSchemaSample: string;
    analyticData: Analytic;
    seasonId: string;
    featureId: string;
    featureAnalyticAttributes: FeatureAnalyticAttributes;
    featureAnalyticDisplayAttributes: DisplayAttribute[];
    configAnalyticAtributes: any[];
    feature: Feature;
    branch: Branch;

    constructor(private _airLockService: AirlockService, @Inject(ElementRef) elementRef: ElementRef, private _featureUtils: FeatureUtilsService,
                private authorizationService: AuthorizationService, private zone: NgZone
        , private _stringsSrevice: StringsService, private toastrService: NbToastrService,
                private modalRef: NbDialogRef<wlAttributesModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.loading = false;
        this.featureId = this.feature.uniqueId;
        if (this.analyticData) {
            let selectedAttributes: Attribute[];
            for (var i in this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics) {
                if (this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics[i].id === this.featureId) {
                    selectedAttributes = this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics[i].attributes;
                }
            }
            this.featureAnalyticDisplayAttributes = this.generateDisplayAttributes(selectedAttributes, this.featureAnalyticAttributes);
        }
        this.loaded = true;
    }

    initAfterClose() {
    }

    save() {
        this._save();
    }

    _save() {
        this.loading = true;
        var featureAttributesExist = false;
        for (var i = 0; i < this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics.length; i++) {
            if (this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics[i].id === this.featureId) {
                var attr = this.displayAttributesToAttributes(this.featureAnalyticDisplayAttributes);
                if (attr.length != 0) {
                    this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics[i].attributes = attr;
                } else {
                    this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics.splice(i, 1);
                }
                featureAttributesExist = true;
            }
        }
        if (!featureAttributesExist) {
            var newFeatureAnalyticAttributeArr: FeatureAnalyticAttributes;
            newFeatureAnalyticAttributeArr = new FeatureAnalyticAttributes;
            newFeatureAnalyticAttributeArr.id = this.featureId;
            newFeatureAnalyticAttributeArr.attributes = this.displayAttributesToAttributes(this.featureAnalyticDisplayAttributes);
            this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics.push(newFeatureAnalyticAttributeArr);
        }
        this._airLockService.updateAnalyticsGlobalDataCollection(this.feature.seasonId, this.branch.uniqueId, this.analyticData).then(result => {
            this.loading = false;
            this.outputEventAnalyticsAttributesUpdate.emit(null);
            this.close();
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    handleError(error: any, title: string = "Save Failed") {
        this.loading = false;
        if (error == null) {
            return;
        }
        var errorMessage = error._body || "Request failed, try again later.";
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
        }
        console.log("handleError in editFeatureModal:" + errorMessage);
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
    }

    close() {
        this.isOpen = false;
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modalRef.close();
    }

    showRuleHelp() {
        window.open('http://jsonviewer.stack.hu/');
    }

    showAnaliticsHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.lal9wm6w3zm7');
    }

    open(feature: Feature, branch: Branch, analyticData: Analytic, featureAnalyticAttributes: FeatureAnalyticAttributes) {

        this.loading = false;
        this.title = this.getString("add_attributes_to_whitelist_title");
        this.isOpen = true;

        // create analytic data
        this.configAnalyticAtributes = [];
        this.feature = feature;
        this.featureId = feature.uniqueId;
        this.branch = branch;
        this.analyticData = analyticData;
        this.featureAnalyticAttributes = featureAnalyticAttributes;
        let selectedAttributes: Attribute[];

        if (this.analyticData) {

            for (var i in this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics) {
                if (this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics[i].id === this.featureId) {
                    selectedAttributes = this.analyticData.analyticsDataCollection.featuresAttributesForAnalytics[i].attributes;
                }
            }
            this.featureAnalyticDisplayAttributes = this.generateDisplayAttributes(selectedAttributes, this.featureAnalyticAttributes);

        }
        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                // if (this.aceModalContainerDialog) {
                //     this.aceModalContainerDialog.closeDontSaveDialog();
                // }
                // this.modal.open('md');
            });

        }

    }

    displayAttributesToAttributes(displayedAttributes) {
        let attributes = new Array<Attribute>();

        /*let dAttributes = new Array<DisplayAttribute>();
         dAttributes.push({name: ['size', '.color'], type: 'ARRAY', arrayPattern: ['[1-7]'], selected:true});
         dAttributes.push({name: ['size'], type: 'REGULAR', arrayPattern: [], selected:true});
         dAttributes.push({name: ['precip'], type: 'CUSTOM', arrayPattern: [], selected:true});*/
        let dAttributes = displayedAttributes;

        dAttributes.forEach(function (dAttribute) {
            let type = dAttribute.type;
            if (type == 'ARRAY' && dAttribute.selected) {
                let name = '';
                for (var i = 0; i < dAttribute.name.length; i++) {
                    // if (dAttribute.name[i] == ']')
                    //     break;
                    name = name + dAttribute.name[i];
                    if (dAttribute.arrayPattern[i])
                        name = name + dAttribute.arrayPattern[i];
                }
                attributes.push({name: name, warning: "", type: dAttribute.type});
            } else if (type == 'REGULAR' && dAttribute.selected) {
                attributes.push({name: dAttribute.name[0], warning: "", type: dAttribute.type});
            } else if (type == 'CUSTOM') {
                if (dAttribute.name[0])
                    attributes.push({name: dAttribute.name[0], warning: "", type: dAttribute.type});
            }
        });
        return attributes;
    }

    generateDisplayAttributes(selectedAttributes, allAttributes) {
        /*let attributes = new Array<Attribute>();
         attributes.push({name: 'arr1[].color', type: 'ARRAY'});
         attributes.push({name: 'size', type: 'REGULAR'});
         attributes.push({name: 'precip', type: 'CUSTOM'});

         let wlAttributes = new Array<Attribute>();
         wlAttributes.push({name: 'arr1[1-7].color', type: 'ARRAY'});
         wlAttributes.push({name: 'size', type: 'REGULAR'});
         wlAttributes.push({name: 'precip', type: 'CUSTOM'});
         */

        if (!selectedAttributes) selectedAttributes = [];
        if (!allAttributes) allAttributes = [];
        let attributes = allAttributes.attributes;
        let wlAttributes = selectedAttributes;
        let dAttributes = new Array<DisplayAttribute>();

        attributes.forEach(function (attribute) {
            let names = [attribute.name];
            let patterns = [];
            dAttributes.push({name: names, type: attribute.type, arrayPattern: patterns, selected: false});
        });
        selectedAttributes.forEach(function (attribute) {
            let type = attribute.type;
            if (type == 'CUSTOM') {
                let names = [attribute.name];
                let patterns = [];
                dAttributes.push({name: names, type: attribute.type, arrayPattern: patterns, selected: false});
            }
            let warn = attribute.warning;
            if (warn) {
                let names = [attribute.name];
                let patterns = [];
                dAttributes.push({name: names, type: attribute.type, arrayPattern: patterns, selected: false});
            }
        });
        let prepareArray = function (dAttribute, name: string) {
            let names = [];
            let patterns = [];
            let startName = 0;
            let startPattern = 0;

            for (var i = 0; i < name.length; i++) {
                if (name.charAt(i) == '[') {
                    names[names.length] = name.substring(startName - 1, i + 1);
                    startPattern = i;
                }
                if (name.charAt(i) == ']') {
                    patterns[patterns.length] = name.substring(startPattern + 1, i);
                    startName = i + 1;
                }
                if (i == (name.length - 1)) {
                    if ((startName > startPattern)) {
                        if (startName < name.length - 1) {
                            names[names.length] = name.substring(startName - 1, i + 2);
                        } else {
                            names[names.length] = ']';
                        }
                    } else {
                        patterns[patterns.length] = name.substring(startPattern + 1, i - 1);
                    }
                }
            }
            dAttribute.name = names;
            dAttribute.arrayPattern = patterns;
        };
        if (wlAttributes) {
            dAttributes.forEach(function (dAttribute) {
                let type = dAttribute.type;
                if (type == 'ARRAY' && !dAttribute.selected) {
                    let merged = false;
                    wlAttributes.forEach(function (wlAttribute) {
                        //if (true)
                        if (dAttribute.name.length > 0) {
                            if (wlAttribute.name.replace(/\[.*\]/g, '') == dAttribute.name[0].replace(/\[.*\]/g, '')) {
                                if (dAttribute.type == wlAttribute.type) {
                                    prepareArray(dAttribute, wlAttribute.name);
                                    dAttribute.selected = true;
                                    merged = true;
                                }
                            }
                        }
                    });
                    if (!merged) {
                        prepareArray(dAttribute, dAttribute.name[0]);
                    }
                } else if (type == 'REGULAR') {
                    wlAttributes.forEach(function (wlAttribute) {
                        if (wlAttribute.name == dAttribute.name[0]) {
                            dAttribute.selected = true;
                        }
                    });
                }
            });
        }
        return dAttributes;
    }

    arrayNameEquals(a1: string, a2: string) {
        return a1.replace(/\[.*\]/g, '') == a2.replace(/\[.*\]/g, '');
    }

    onAnalyticSelectingSelect(event) {
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
    }

    onDestroy(event) {
    }


}



