/**
 * Created by yoavmac on 17/08/2016.
 */

import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {ViewChild} from "@angular/core";


import {SeasonModal} from "../../../../theme/airlock.components/seasonModal";
import {AirlockService} from "../../../../services/airlock.service";
import {Product} from "../../../../model/product";
import {Season} from "../../../../model/season";
import {Analytic} from "../../../../model/analytic"
import {AuthorizationService} from "../../../../services/authorization.service";
import {DocumentlinksModal} from "../../../../theme/airlock.components/documentlinksModal/documentlinksModal.component";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {EditInputSchemaModal} from "../../../../theme/airlock.components/editInputSchemaModal/editInputSchemaModal.component";
import {StringsService} from "../../../../services/strings.service";
import {Branch} from "../../../../model/branch";
import {EditBranchModal} from "../../../../theme/airlock.components/editBranchModal/editBranchModal.component";

@Component({
    selector: 'product-detail',
    styles: [require('./product-detail.scss')],
    template: require('./product-detail.html')
})
export class ProductDetail {

    @ViewChild('seasonModal') _seasonModal : SeasonModal;
    @ViewChild('documentLinksModal') _documentLinksModal : DocumentlinksModal;

    @ViewChild('editInputSchemaModal') _editInputSchemaModal : EditInputSchemaModal;
    @ViewChild('editBranchModal') _editBranchModal : EditBranchModal;
    _product : Product;
    _season : Season;
    _productCopy : Product;
    _isDisaplyOnly:boolean = false;
    _isHideDowloadLinks:boolean = false;
    loading: boolean = false;
    branches:Branch[] = null;
    canUseBranches:boolean;
    staticMode:boolean = false;
    @Output() onProductUpdated = new EventEmitter();
    @Output() onSeasonsChanged = new EventEmitter();
    ruleUtilitieInfo: string;
    ruleInputSchemaSample : string;
    public status: {openId: string} = {openId: null};

    constructor(private _airlockService : AirlockService,private authorizationService:AuthorizationService,
        public modal: Modal, private _stringsSrevice: StringsService) {
        this.setUserCreds();
        this.staticMode = this._airlockService.isStaticMode();
    }
    setUserCreds(){
        console.log("setUserCreds");
        console.log(this._airlockService.getUserRole());
        this._isDisaplyOnly = (this._airlockService.isEditor() || this._airlockService.isViewer());
        this._isHideDowloadLinks = this._airlockService.isViewer();

    }
    isShowOptions(){
            return (!this._airlockService.isViewer()) ;
    }
    isShowAddSeason(){
        return this._airlockService.isAdministrator() || this._airlockService.isProductLead() ;
    }
    isShowEditSeason(){
        return this._airlockService.isAdministrator() || this._airlockService.isProductLead();
    }
    @Input()
    set product (p:Product){
        console.log("SET PRODUCT");
        console.log(this._season);
        var isTheSameProd = (p != null && this._product != null &&  p.uniqueId == this._product.uniqueId);
        this._product = p;
        this.setUserCreds();
        this._airlockService.setCapabilities(p);
        this.canUseBranches = this._airlockService.canUseBranches();
        this._productCopy = new Product(p);
        if(!isTheSameProd) {
            if(p != null && p.seasons != null && p.seasons.length > 0){
                this.selectSeason(p.seasons[p.seasons.length -1 ]);
            }else {
                console.log("Init Selected season")
                this.branches = null;
                this._season = null;
            }
        }else{
            if(this._season){
                this.selectSeason(this._season);
            }else if(p != null && p.seasons != null && p.seasons.length > 0){
                this.selectSeason(p.seasons[p.seasons.length -1 ]);
            }
        }

    }

    onSave()
    {
        if (this.didProductChange() && this._productCopy.name.trim() !== "" && this._productCopy.codeIdentifier.trim() != "") {


            // if (confirm(`Are you sure you want to save the changes to the ${this._product.name} product?`)) {
            //
            //
            // }
            let message = `Are you sure you want to save the changes to the product ${this._product.name}?`;

            this.modal.confirm()
                .title(message)
                .open()
                .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                .then(result => {
                    console.log("confirmed");
                    this._save();
                }) // if were here ok was clicked.
                .catch(err => console.log("CANCELED"));
        }
    }

    getProductFollowTooltip(isfollowed: boolean){
        if(!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");
        if(isfollowed){
            return this.getString('notifications_unfollow_tooltip_products');
        }
        else{
            return this.getString('notifications_follow_tooltip_products');
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format:string[]) {
        return this._stringsSrevice.getStringWithFormat(name,...format);
    }

    starClicked(event,product : Product){
        console.log("star-clicked");
        if(event) {
            event.stopPropagation();
        }
        if(!this._airlockService.isHaveJWTToken())
            return;
        if (product.isCurrentUserFollower){
            this.loading = true;
            this._airlockService.unfollowProduct(product.uniqueId)
                .then(response  => {
                    console.log(response);
                    product.isCurrentUserFollower = false;
                    this.loading = false;
                    this.onProductUpdated.emit(product);
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_unfollow_product_success",product.name)});
                })
                .catch(error => {
                    this.loading = false;
                    console.log('Error in unfollow product');
                    
                    this._airlockService.notifyDataChanged("error-notification", this.getString("notifications_unfollow_product_error"));
                });
        }
        else{
            this.loading = true;
            this._airlockService.followProduct(product.uniqueId)
                .then(response  => {
                    console.log(response);
                    product.isCurrentUserFollower = true;
                    this.onProductUpdated.emit(product);
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_follow_product_success",product.name)});
                })
                .catch(error => {
                    this.loading = false;
                    console.log('Error in follow product');
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    this._airlockService.notifyDataChanged("error-notification", this.getString("notifications_follow_product_error"));
                });
        }
    }

    canShowDeleteBranch(b:Branch){
        if(b.uniqueId == "MASTER"){
            return false;
        }
        return !this._airlockService.isViewer();
    }

    canShowEditBranch(b:Branch){
        if(b.uniqueId == "MASTER"){
            return false;
        }
        return !this._airlockService.isViewer();
    }

    deleteBranch(b:Branch){
        let message = `Are you sure you want to delete this branch (`+b.name+`)?`;
        this.modal.confirm()
            .title(message)
            .open()
            .catch(err => {
                console.log("ERROR")
            }) // catch error not related to the result (modal open...)
            .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            .then(result => {
                console.log("confirmed");
                this.loading = true;
                this._airlockService.deleteBranch(b.uniqueId).then(response  => {
                    console.log(response);
                    this.showBranches(this._season);
                    this.onProductUpdated.emit(this._product);
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getString("notifications_delete_feature_success")});
                })
                    .catch(error => {
                        this.loading = false;
                        this._airlockService.navigateToLoginIfSessionProblem(error);
                        console.log('Error in delete Branch');
                        console.log(error);
                        var errorMessage:string  = "";
                        if(error && error._body){
                            try{
                                var errorObj = JSON.parse(error._body);
                                errorMessage = errorObj.error;
                            }catch (e){
                                errorMessage = this.getString("notifications_delete_feature_error");
                            }

                        }else{
                            errorMessage = this.getString("notifications_delete_feature_error");
                        }
                        this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    });
            }) // if were here ok was clicked.
            .catch(err => console.log("CANCELED"));
    }
    openMenu(event,id:string){
        if(event) {
            event.stopPropagation();
        }
        console.log("click:"+id);
        // if(this.status.openId == id){
        //     this.status = {openId: null};
        // }else {
            this.status = {openId: null};
            setTimeout(() => {
                this.status = {openId: id};
            }, 50);
        // }
    }
    _save() {
        this.loading = true;
        let seasons = this._productCopy.seasons;
        this._productCopy.seasons = null;
        this._airlockService.updateProduct(this._productCopy)
            .then(response  => {
                this._productCopy.seasons = seasons;
                // alert(`Product ${response.name} was updated successfully!`);
                this._airlockService.notifyDataChanged("success-notification",{title: "Success" ,
                    message:`Product ${response.name} was updated successfully!`});
                this.onProductUpdated.emit(response);
                this.loading = false;
            })
            .catch(error => {
                this._productCopy.seasons = seasons;
                this.loading = false;
                this._airlockService.navigateToLoginIfSessionProblem(error);
                let errorMessage = this._airlockService.parseErrorMessage(error, "");
                this._airlockService.notifyDataChanged("error-notification",`Failed to update product: ${errorMessage}`);
            });
    }
    onReset(){

        if (this.didProductChange()) {
            // if (confirm('Are you sure you want to reset all fields to their original value?')) {
            //
            //     this._productCopy = new Product(this._product);
            // }

            let message = 'Are you sure you want to reset all fields to their original values?';

            this.modal.confirm()
                .title(message)
                .open()
                .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                .then(result => {
                    console.log("confirmed");
                    this._productCopy = new Product(this._product);
                }) // if were here ok was clicked.
                .catch(err => console.log("CANCELED"));
        }
    }

    onAddSeason(){

        console.log(`ON ADD SEASON`);

        this._season = null;
        this._seasonModal.open(true, false);
    }
    onEditBranch(branch: Branch){
        this._editBranchModal.open(branch);
    }
    branchEdited(branch: Branch){
        this.showBranches(this._season);
        this.onProductUpdated.emit(this._product);
    }

    selectSeason(season : Season){
        console.log("SELECT selectSeason");
        console.log(season);
        this._season = new Season(season);
        this.status = {openId: null};
        this.showBranches(this._season);
    }
    showBranches(season:Season){
        if(this.canUseBranches){
            console.log("showBranches");
            console.log(season);
            this.loading = true;
            this._airlockService.getBranches(season.uniqueId)
                .then(response  => {
                    this.branches = response;
                    this.loading = false;
                })
                .catch(error => {
                    this.branches = null;
                    this.loading = false;
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    let errorMessage = this._airlockService.parseErrorMessage(error, "");
                    this._airlockService.notifyDataChanged("error-notification",`Failed to load branches: ${errorMessage}`);
                });
        }
    }
    onEditSeason(season : Season){

        console.log(`ON EDIT SEASON ${season.name}`);

        this._season = season;
        var lastSeason = this._product.seasons[this._product.seasons.length-1]==season;
        this._seasonModal.open(false, lastSeason);
    }
    onEditInputSchema(season : Season){
        this.loading = true;
        this._airlockService.getInputSchema(season.uniqueId)
            .then(response  => {
                console.log("inputschema");
                console.log(response);
                const editMode = this.isShowEditSchema();
                this._editInputSchemaModal.open(response,season, editMode);
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                this._airlockService.navigateToLoginIfSessionProblem(error);
                let errorMessage = this._airlockService.parseErrorMessage(error, "");
                this._airlockService.notifyDataChanged("error-notification",`Failed to update input schema: ${errorMessage}`);
            });
    }
    isShowEditSchema(){
        if(this._airlockService.isGlobalUserProductLead() || this._airlockService.isGlobalUserAdministrator()){
            return true;
        }
        return !this._airlockService.isViewer() && !this._airlockService.isEditor();
    }
    downloadSeason(season : Season){
        console.log("downloadSeason");
        this._airlockService.downloadSeasonFeatures(season);

    }
    onShowDocumentLinks(season : Season){

        console.log(`ON Show Documents ${season.name}`);


        this._documentLinksModal.open(season.uniqueId, season.platforms);
    }

    seasonAdded(season : Season){
        console.log(`SEASON ADDED ${season.name}`);
        this.onSeasonsChanged.emit(season);
    }

    seasonEdited(season : Season){
        console.log(`SEASON EDITED ${season.name}`);
        this.onSeasonsChanged.emit(season);
    }

    seasonDeleted(season : Season){
        console.log(`SEASON DELETED ${season.name}`);
        if(season != null && this._season != null && season.uniqueId == this._season.uniqueId){
            this._season = null;
        }
        this.onSeasonsChanged.emit(season);
    }

    private didProductChange() : boolean {
        return (this._product.name !== this._productCopy.name ||
                this._product.codeIdentifier !== this._productCopy.codeIdentifier ||
                this._product.description !== this._productCopy.description);
    }

    private arraysIdentical(arrayA, arrayB) : boolean{
        if(!arrayA && !arrayB)
            return true;
        if((arrayA && !arrayB) || (!arrayA && arrayB))
            return false;
        var i = arrayA.length;
        if (i != arrayB.length)
            return false;
        while (i--) {
            if (arrayA[i] !== arrayB[i])
                return false;
        }
        return true;
    }

}
