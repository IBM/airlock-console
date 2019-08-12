/**
 * Created by itaig on 29/08/2016.
 */
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Product } from '../model/product';
import { Season } from '../model/season';
import { Feature } from '../model/feature';
import { UserGroups } from '../model/user-groups';
import {Experiment} from "../model/experiment";
import {Variant} from "../model/variant";
import {InAppPurchase} from "../model/inAppPurchase";
import {PurchaseOptions} from "../model/purchaseOptions";


@Injectable()
export class FeatureUtilsService {
    static parseErrorMessage(error: any): string {
        var errorMessage = error._body || "Request failed, try again later.";
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch(err) {
            if(errorMessage != null && (typeof errorMessage === 'string' || errorMessage instanceof String) && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
                errorMessage = errorMessage.substring(1,errorMessage.length -1);
            }
        }


        return errorMessage;
    }
    static isIdMode = false;
    isContainCyclePurchases(possibleSon:InAppPurchase,features:Array<InAppPurchase>){
        console.log(possibleSon + " - " + features);
        if(features == null){
            return false;
        }
        for(var curFeature of features){
            if(curFeature.uniqueId == possibleSon.uniqueId){
                return true;
            }
            if(this.isContainCycle(possibleSon,curFeature.entitlements)){
                return true;
            }
        }
        return false;
    }
    isContainCycle(possibleSon:Feature,features:Array<Feature>){
        console.log(possibleSon + " - " + features);
        if(features == null){
            return false;
        }
        for(var curFeature of features){
            if(curFeature.uniqueId == possibleSon.uniqueId){
                return true;
            }
            if(this.isContainCycle(possibleSon,curFeature.features)){
                return true;
            }
        }
        return false;
    }
    getFeatureInFlatListById(parentFeatureInFlatList:Array<FeatureInFlatList>,id:string){
        for(var item of parentFeatureInFlatList){
            if(item.feature.uniqueId == id){
                return item;
            }
        }
        return null;
    }

    getInAppPurchaseInFlatListById(parentFeatureInFlatList:Array<InAppPurchaseInFlatList>,id:string){
        for(var item of parentFeatureInFlatList){
            if(item.feature.uniqueId == id){
                return item;
            }
        }
        return null;
    }

    getInPurchaseOptionsInFlatListById(parentFeatureInFlatList:Array<PurchaseOptionsInFlatList>,id:string){
        for(var item of parentFeatureInFlatList){
            if(item.feature.uniqueId == id){
                return item;
            }
        }
        return null;
    }

    getFeatureDisplayName(feature:Feature){
        if (feature == null){
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return feature.uniqueId;
        }

        if(feature.displayName === null || feature.displayName === undefined || feature.displayName === ''){
            return feature.name;
        }
        else{
            return feature.displayName;
        }

    }
    
    getExperimentDisplayName(exp:Experiment) {
        if (exp == null) {
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return exp.uniqueId;
        }
        if(exp.displayName === null || exp.displayName === undefined || exp.displayName === ''){
            return exp.name;
        }
        else{
            return exp.displayName;
        }
    }

    getVariantDisplayName(variant:Variant) {
        if (variant == null) {
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return variant.uniqueId;
        }
        if(variant.displayName === null || variant.displayName === undefined || variant.displayName === ''){
            return variant.name;
        }
        else{
            return variant.displayName;
        }
    }

    getFeatureFullName(feature:Feature) {
        if (feature == null){
            return "";
        }
        if (/*feature.type  == "CONFIGURATION_RULE" ||*/ feature.type == "CONFIG_MUTUAL_EXCLUSION_GROUP") {
            return feature.name;
        }
        if (feature.namespace && feature.namespace.length > 0) {
            return feature.namespace + "." + feature.name;
        }
        return feature.name;
    }

    getFeatureDisplayNameInTree(feature:Feature){
        var name:string = "";
        if(feature == null){
             return "";
        }
        if(feature.type == "FEATURE" || feature.type == null ||
            feature.type == "ENTITLEMENT" || feature.type == "PURCHASE_OPTIONS"){
            //console.log('In getFeatureDisplayName Feature display: ', feature.displayName);
            name = this.getFeatureDisplayName(feature);
            /*
            if(feature.displayName === null || feature.displayName === undefined || feature.displayName === ''){
                name = feature.name;
            }
            else{
                name = feature.displayName;
            }*/
        }else{
            name = "Mutual Exclusion Group";
        }
        return name;
    }
    getNameWithSpaces(feature:Feature,level:number){
        var finalName = "-";
        var name:string = this.getFeatureDisplayNameInTree(feature);
        for(var i =0;i<level;++i){
            finalName += " ";
        }
        finalName += name;
        return finalName;
    }
    addFeatureAtLevel(curFeature:Feature,parentFeature:Feature,featureInFlatList:Array<FeatureInFlatList>,curLevel:number,useConfigurationans:boolean=true){
        // console.log('current feature:', curFeature);
        featureInFlatList.push(new FeatureInFlatList(curFeature,parentFeature,curLevel,this.getNameWithSpaces(curFeature,curLevel)));
        if(curFeature.type === 'FEATURE' || curFeature.type === 'MUTUAL_EXCLUSION_GROUP') {
            for (var curSon of curFeature.features) {

                this.addFeatureAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }

        if (typeof curFeature.configurationRules != "undefined" && useConfigurationans) {
            // console.log('FEATURE CONFIGURATION:', curFeature.configurationRules);
            for (var curSon of curFeature.configurationRules) {
                this.addFeatureAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }
    }

    addInAppPurchaseAtLevel(curFeature:InAppPurchase,parentFeature:InAppPurchase,featureInFlatList:Array<InAppPurchaseInFlatList>,curLevel:number,useConfigurationans:boolean=true){
        // console.log('current feature:', curFeature);
        featureInFlatList.push(new InAppPurchaseInFlatList(curFeature,parentFeature,curLevel,this.getNameWithSpaces(curFeature,curLevel)));
        if(curFeature.type === 'ENTITLEMENT' || curFeature.type === 'ENTITLEMENT_MUTUAL_EXCLUSION_GROUP') {
            for (var curSon of curFeature.entitlements) {

                this.addInAppPurchaseAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }

        if (typeof curFeature.configurationRules != "undefined" && useConfigurationans) {
            // console.log('FEATURE CONFIGURATION:', curFeature.configurationRules);
            for (var curConf of curFeature.configurationRules) {
                this.addFeatureAtLevel(curConf, curFeature, featureInFlatList, curLevel + 1);
            }
        }
    }

    addInPurchaseOptionAtLevel(curFeature:PurchaseOptions,parentFeature:PurchaseOptions,featureInFlatList:Array<PurchaseOptionsInFlatList>,curLevel:number,useConfigurationans:boolean=true){
        // console.log('current feature:', curFeature);
        featureInFlatList.push(new PurchaseOptionsInFlatList(curFeature,parentFeature,curLevel,this.getNameWithSpaces(curFeature,curLevel)));
        if(curFeature.type === 'PURCHASE_OPTIONS' || curFeature.type === 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
            for (var curSon of curFeature.purchaseOptions) {

                this.addInPurchaseOptionAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }

        if (typeof curFeature.configurationRules != "undefined" && useConfigurationans) {
            // console.log('FEATURE CONFIGURATION:', curFeature.configurationRules);
            for (var curConf of curFeature.configurationRules) {
                this.addFeatureAtLevel(curConf, curFeature, featureInFlatList, curLevel + 1);
            }
        }
    }

    getDisplayNameForBothFeatureAndMX(feature:Feature){
        if(feature.type == "MUTUAL_EXCLUSION_GROUP"){
            return this.getMXDisplayName(feature);
        }else{
            return this.getFeatureDisplayName(feature);
        }
    }

    getDisplayNameForBothPurchaseAndMX(feature:InAppPurchase){
        if(feature.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP"){
            return this.getPurchaseMXDisplayName(feature);
        }else{
            return this.getFeatureDisplayName(feature);
        }
    }
    filterEmptyMTX(features:Feature[]) {
        if (!features) {
            return features;
        }
        var filteredList = [];
        for (var feature of features) {
            if(feature.type == "MUTUAL_EXCLUSION_GROUP" && !(feature.features && feature.features.length > 0)) {

            } else {
                filteredList.push(feature);
            }
        }
        return filteredList;
    }
    getMXDisplayName(feature:Feature) {
        let sons = "";
        let items = feature.features;
        if(items != null && items.length > 0) {
            for (let item of items) {
                let subfeat: Feature = item;
                if (sons == "") {
                    sons = "Group: " + this.getFeatureDisplayName(subfeat);
                } else {
                    sons += " \\ " + this.getFeatureDisplayName(subfeat);
                }
            }
            return sons;
        }else{
            return "Empty MX";
        }
    }

    getPurchaseMXDisplayName(feature:InAppPurchase) {
        let sons = "";
        let items = feature.entitlements;
        if(items != null && items.length > 0) {
            for (let item of items) {
                let subfeat: InAppPurchase = item;
                if (sons == "") {
                    sons = "Group: " + this.getFeatureDisplayName(subfeat);
                } else {
                    sons += " \\ " + this.getFeatureDisplayName(subfeat);
                }
            }
            return sons;
        }else{
            return "Empty MX";
        }
    }

    getPurchaseOptionsMXDisplayName(feature:PurchaseOptions) {
        let sons = "";
        let items = feature.purchaseOptions;
        if(items != null && items.length > 0) {
            for (let item of items) {
                let subfeat: PurchaseOptions = item;
                if (sons == "") {
                    sons = "Group: " + this.getFeatureDisplayName(subfeat);
                } else {
                    sons += " \\ " + this.getFeatureDisplayName(subfeat);
                }
            }
            return sons;
        }else{
            return "Empty MX";
        }
    }

    getPossibleParentsInFlatList(rootFeatuteGroups : Array<Feature>,rootId:string,useConfigurationans:boolean=true){
        var featureInFlatList: Array<FeatureInFlatList> = [];
        var rootFeature:Feature = new Feature();
        rootFeature.uniqueId = rootId;
        rootFeature.name="ROOT";
        featureInFlatList.push(new FeatureInFlatList(rootFeature,null,-1,"Root"));
        console.log(rootFeatuteGroups)
        for(var curFeature of rootFeatuteGroups){
            this.addFeatureAtLevel(curFeature,null,featureInFlatList,0,useConfigurationans);
        }
        console.log(featureInFlatList);
        return featureInFlatList;
    }

    getPossiblePurchaseParentsInFlatList(rootFeatuteGroups : Array<InAppPurchase>,rootId:string,useConfigurationans:boolean=true){
        var featureInFlatList: Array<InAppPurchaseInFlatList> = [];
        var rootFeature:InAppPurchase = new InAppPurchase();
        rootFeature.uniqueId = rootId;
        rootFeature.name="ROOT";
        featureInFlatList.push(new InAppPurchaseInFlatList(rootFeature,null,-1,"Root"));
        console.log(rootFeatuteGroups)
        for(var curFeature of rootFeatuteGroups){
            this.addInAppPurchaseAtLevel(curFeature,null,featureInFlatList,0,useConfigurationans);
        }
        console.log(featureInFlatList);
        return featureInFlatList;
    }

    getPossiblePurchaseOptionsParentsInFlatList(rootFeatuteGroups : Array<PurchaseOptions>,rootId:string,useConfigurationans:boolean=true){
        var featureInFlatList: Array<PurchaseOptionsInFlatList> = [];
        var rootFeature:PurchaseOptions = new PurchaseOptions();
        rootFeature.uniqueId = rootId;
        rootFeature.name="ROOT";
        featureInFlatList.push(new PurchaseOptionsInFlatList(rootFeature,null,-1,"Root"));
        console.log(rootFeatuteGroups);
        for(var curFeature of rootFeatuteGroups){
            this.addInPurchaseOptionAtLevel(curFeature,null,featureInFlatList,0,useConfigurationans);
        }
        console.log(featureInFlatList);
        return featureInFlatList;
    }

    static isVersionSmaller(version:string, versionToCompare:string):boolean {
        if (version==versionToCompare) {
            return false;
        }
        var versionArr = version.split('.');
        var versionToCompareArr = versionToCompare.split('.');
        let maxNum = Math.max(versionArr.length,versionToCompareArr.length);
        for (var i=0;i<maxNum;i++) {
            var versionNum = 0;
            if (i<versionArr.length) {
                versionNum = Number(versionArr[i]);
            }
            var versionToCompareNum = 0;
            if (i<versionToCompareArr.length) {
                versionToCompareNum = Number(versionToCompareArr[i]);
            }
            /*if (!versionToCompareNum || !versionNum || versionToCompareNum==null || versionNum==null) {
                return false;
            }*/

            if (versionNum < versionToCompareNum) {
                return true;
            } else if (versionNum > versionToCompareNum) {
                return false;
            }
        }
        return false;


    }

    static cloneFeature(feature: Feature) {
        if (feature.type == "ENTITLEMENT" || feature.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP") {
            return InAppPurchase.clone(feature as InAppPurchase);
        } else if (feature.type == "PURCHASE_OPTIONS" || feature.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") {
            return PurchaseOptions.clone(feature as PurchaseOptions);
        } else {
            return Feature.clone(feature);
        }
    }

}
export class FeatureInFlatList{
    constructor(public feature:Feature,public parent:Feature,public level:number,public displayString:string){};
}

export class InAppPurchaseInFlatList extends FeatureInFlatList{
    constructor(public feature:InAppPurchase,public parent:InAppPurchase,public level:number,public displayString:string){
        super(feature, parent, level, displayString);
    };
}

export class PurchaseOptionsInFlatList extends FeatureInFlatList{
    constructor(public feature:PurchaseOptions,public parent:PurchaseOptions,public level:number,public displayString:string){
        super(feature, parent, level, displayString);
    };
}