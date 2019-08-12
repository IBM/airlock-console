
import {Component, Injectable, Input, EventEmitter, Output, ElementRef, ViewChild,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';
import {AirlockService} from "../../../../services/airlock.service";
import {Feature} from "../../../../model/feature";
import {AuthorizationService} from "../../../../services/authorization.service";
import {FeatureUtilsService} from "../../../../services/featureUtils.service";
import {InAppPurchase} from "../../../../model/inAppPurchase";
import {PurchaseOptions} from "../../../../model/purchaseOptions";

@Component({
    providers: [FeatureUtilsService],
    selector: 'included-purchases-node',
    styles: [require('./includedPurchasesNode.scss')],
    // directives: [UiSwitchComponent, HirarchyNode,COMMON_DIRECTIVES, DND_DIRECTIVES,PROGRESSBAR_DIRECTIVES, CORE_DIRECTIVES
    //     ,DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, AlertComponent,ProgressbarComponent],
    template: require('./includedPurchasesNode.html'),

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncludedPurchasesNode {
    @ViewChild('noderef') noderef: ElementRef;
    @Input() feature:InAppPurchase;
    @Input() featurePath:Array<Feature>;
    @Input() targetFeature: InAppPurchase;
    @Input() currentFather: InAppPurchase;
    @Input() parentFeatureId:string;
    @Input() contextFeatureId:string;
    @Input() level: number = 0;
    @Input() insideMX: boolean;
    @Input() markedFeatureId: string = null;
    @Input() readOnly: boolean = false;
    @Input() shouldOpenCell: boolean;
    @Input() openFeatures: Array<string> = [];
    @Input() featureType: string = 'FEATURE';
    @Input() mtxType: string = 'MUTUAL_EXCLUSION_GROUP';
    @Output() onCellClick:EventEmitter<string>= new EventEmitter<string>();
    @Output() onCellSelected:EventEmitter<Feature>= new EventEmitter<Feature>();
    nextLevel: number;
    containerClass: string;
    isOpen: boolean=false;
    remove: boolean=true;

    constructor(private _airlockService:AirlockService,private authorizationService:AuthorizationService, private _featureUtils:FeatureUtilsService
    ,private cd: ChangeDetectorRef) {
        if (this.isFeature()) {
            this.nextLevel = this.level + 1;
        } else {
            this.nextLevel = this.level + 1;
        }
    }

    showSubTree():boolean{
        return this.isCellOpen(this.feature.uniqueId) || this.isOpen;
    }
    myCellSelected(obj:Feature) {
        this.onCellSelected.emit(obj);
    }
    isShowOptions(){
        return (!this._airlockService.isViewer());
    }
    isShowAddToGroup(){
        return (!this._airlockService.isViewer());
    }
    isShowReorder(){
        return (!this._airlockService.isViewer());
    }
    isFeature():boolean {
        return this.feature && this.feature.type && this.feature.type == this.featureType;
    }
    isMTX():boolean {
        return this.feature && this.feature.type && this.feature.type == this.mtxType;
    }

    getChildren() {
        if (this.featureType == 'ENTITLEMENT') {
            let purchase = this.feature as InAppPurchase;
            return purchase.entitlements;
        } else if (this.featureType == 'PURCHASE_OPTIONS') {
            return this.feature.purchaseOptions;
        } else {
            return this.feature.features;
        }
    }
    ngOnInit() {

        if (this.shouldOpenCell) {
            // console.log("feature "+ this.feature.name + " - should be open");
            this.remove = false;
            setTimeout(() => {this.isOpen = true;this.cd.markForCheck();}, 0.5);
        } else {
        }
    }

    ngAfterViewInit () {
        // if(this.isTargetFeature()){
        //     this.noderef.nativeElement.scrollTo(0,0);
        // }
    }

    reorder() {

    }

    getDescriptionTooltip(text: string) {
        if (text && text.length > 10) {
            return text;
        } else {
            return "";
        }

    }

    selectFeature() {

    }
    getBackgroundStyle() {
        if (this.isTargetFeature()) {
            return "rgba(256,256,256,"+0.8+")";
        } else {
            return "rgba(0,0,0,0.0)";
        }
        // var level = this.level -1;
        // if (this.insideMX) {
        //     level = level - 1;
        // }
        // var trans = level*0.1;
        // var opac = 1.0 - trans;
        // let toRet = "rgba(256,256,256,"+opac+")";
        // let constRet = "rgba(0,0,0,0.0)";
        // return toRet;
    }

    getIdentBackground() {
        var trans = this.level*0.1;
        let toRet = "rgba(0,0,0,"+trans+")";
        return toRet;
    }
    getCellWidth(cell:number) {
        var identWidth = this.level*2;
        if(cell==0) {
            return identWidth+"%";
        } else if(cell==3) {
            //return (30-identWidth)+"%";
            return "30%";
        } else {
            return "";
        }
    }
    getColorStyle() {
        if (this.isTargetFeature()) {
            return "blue";
        } else {
            return "rgba(256,256,256,0.8)";
        }

        // var trans = this.level*0.15;
        // var num = Math.floor(trans*256);
        // var num1 = Math.floor(this.level*0.4*256);
        // var num2 = Math.floor(this.level*0.3*256);
        // let toRet = "rgba("+num+","+num1+","+num2+",1.0)";
        // let constRet = "rgba(0,0,0,1,0)"
        // return constRet;
    }

    getNextBackgroundStyle() {
        if (!this.isOpen || this.getChildren()==null || this.getChildren().length <=0) {
            return "";//this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel*0.1;
            let toRet = "rgba(0,0,0,"+trans+")";
            return toRet;
        }

    }

    isTargetFeature() {
        if(this.targetFeature == null){
            return false;
        }
        return this.targetFeature.uniqueId==this.feature.uniqueId;
    }

    isCurrentFather() {
        // if (this.featurePath.length <=0) {
        //     return false;
        // } else {
        //     return this.featurePath[this.featurePath.length-1].uniqueId==this.feature.uniqueId;
        // }
        if (this.currentFather) {
            return this.currentFather.uniqueId==this.feature.uniqueId;
        } else {
            return false;
        }
    }
    isMarkedFeature(){
        // console.log("this.markedFeatureId");
        // console.log(this.markedFeatureId);
        if (this.markedFeatureId) {
            return this.markedFeatureId==this.feature.uniqueId;
        } else {
            return false;
        }
    }

    isSelectedFeature() {
        if (this.currentFather && this.currentFather.uniqueId == this.feature.uniqueId) {
            return true;
        } else {
            return false;
        }
    }

    canAddRemove():boolean {
        return true;
    }

    isAlreadyIncluded(purchase: Feature):boolean {
        return this.targetFeature.includedEntitlements && this.targetFeature.includedEntitlements.includes(purchase.uniqueId);
    }
    getNextColorStyle() {
        return this.getColorStyle();
        // if (!this.isOpen || this.feature.features==null || this.feature.features.length <=0) {
        //     return this.getColorStyle();
        // } else {
        //     var trans = this.nextLevel*0.1;
        //     var num = Math.floor(trans*256);
        //     let toRet = "rgba("+num+","+num+","+num+",1.0)";
        //     return toRet;
        // }

    }

    getTextColor() {
        if (this.isTargetFeature()) {
            return "blue";
        } else {
            return "white";
        }

    }

    cellClicked() {
        if (/*this.feature.type=='FEATURE' &&*/ this.getChildren()!=null && this.getChildren().length > 0) {
            if(!this.isOpen) {
                this.remove = false;
                // console.log("cell changed status:"+this.feature.uniqueId);
                this.onCellClick.emit(this.feature.uniqueId);
                setTimeout(() => {this.isOpen = true;this.cd.markForCheck();}, 0.5);
            } else {
                // setTimeout(() => this.isOpen = false, 0.3);
                this.isOpen = false;
                this.remove = true;
                this.onCellClick.emit(this.feature.uniqueId);
            }
        } else {
            this.isOpen = false;
        }
        this.cd.markForCheck();
    }

    cellSelected() {
        if(!this.isTargetFeature()) {
            this.onCellSelected.emit(this.feature);
        }
    }

    transitionEnd() {
        // console.log('transitionEnd');
        if(!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }

    shouldStyleCell() {
        if (this.insideMX && !this.isOpen) {
            return false;
        }/*else  if (this.level > 0 && !this.insideMX) {
            return true;
        }*/
        return true;
        /*else if (this.level==0 || this.isOpen==true) {
            return true;
        } else {
            return false;
        }*/
    }

    shouldAddBorder() {
        if (this.level > 1) {
            return false;
        } else {
            return true;
        }
    }

    isSubFeature() {
        if (this.level > 0) {
            return true;
        } else {
            return false;
        }
    }

    shouldNotStyleCell() {
        return !this.shouldStyleCell();
    }

    shouldNotPad() {
        return this.shouldNotStyleCell() /*&& !(this.insideMX || this.feature.type=='MUTUAL_EXCLUSION_GROUP')*/;
    }
    public myBeforeUpdate(obj:any) {
    }

    public myFeatureChangedStatus(obj:string) {
        this.onCellClick.emit(obj);
    }

    isCellOpen(featureID:string): boolean {
        // console.log("featureID:"+featureID+" , featurePath:"+this.featurePath[0].uniqueId);
        for (let item of this.featurePath) {
            if(item.uniqueId==featureID) {
                // console.log("YAY");
                return true;
            }
        }
        // console.log("Nay");
        return false;
    }

    public myOnUpdate(obj:any) {
    }

    changeStage() {
        this.cd.markForCheck();
    }

    delete() {

    }

    draggedFeature($event) {
        let feature: Feature = $event.dragData;
        //alert('dragged '+feature.name);
    }
    droppedFeature($event) {
        let feature: Feature = $event.dragData;
        alert('dropped '+feature.name);
    }

    removePurchase(purchase: Feature) {
        if (!this.targetFeature.includedEntitlements) {
            this.targetFeature.includedEntitlements = [];
        }
        var index = this.targetFeature.includedEntitlements.indexOf(purchase.uniqueId, 0);
        if (index > -1) {
            this.targetFeature.includedEntitlements.splice(index, 1);
        }
    }

    addPurchase(purchase: Feature) {
        if (!this.targetFeature.includedEntitlements) {
            this.targetFeature.includedEntitlements = [];
        }
        this.targetFeature.includedEntitlements.push(purchase.uniqueId);
    }
}
