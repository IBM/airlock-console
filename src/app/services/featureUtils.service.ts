/**
 * Created by itaig on 29/08/2016.
 */
import {Injectable} from '@angular/core';

import 'rxjs/add/operator/toPromise';
import {Feature} from '../model/feature';
import {Experiment} from "../model/experiment";
import {Variant} from "../model/variant";
import {InAppPurchase} from "../model/inAppPurchase";
import {PurchaseOptions} from "../model/purchaseOptions";
import {IndexRange} from "../model/indexingInfo";
import {Rule} from "../model/rule";
import {Stream} from "../model/stream";
import {AirlockNotification} from "../model/airlockNotification";
import {Webhook} from "../model/webhook";
import {Cohort} from "../model/cohort";
import {CohortExport} from "../model/cohortExport";
import {Poll} from "../model/poll";
import {BasePoll} from "../model/basePoll";
import { Question } from 'app/model/question';
import {Visualization} from "../model/visualization";
import {PredefinedAnswer} from "../model/predefinedAnswer";
import {OpenAnswer} from "../model/openAnswer";


@Injectable({providedIn: 'root'})
export class FeatureUtilsService {
    static parseErrorMessage(error: any): string {
        let errorMessage = error.error?.error || error._body || error.message || 'Request failed, try again later.';
        try {
            let jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch (err) {
            if (errorMessage != null && (typeof errorMessage === 'string' || errorMessage instanceof String) && errorMessage.indexOf("{") === 0 && errorMessage.indexOf("}") === errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }


        return errorMessage;
    }

    static isIdMode = false;

    isContainCyclePurchases(possibleSon: InAppPurchase, features: Array<InAppPurchase>) {
        if (features === null) {
            return false;
        }
        for (let curFeature of features) {
            if (curFeature.uniqueId === possibleSon.uniqueId) {
                return true;
            }
            if (this.isContainCycle(possibleSon, curFeature.entitlements)) {
                return true;
            }
        }
        return false;
    }

    isContainCycle(possibleSon: Feature, features: Array<Feature>) {
        if (features === null) {
            return false;
        }
        for (let curFeature of features) {
            if (curFeature.uniqueId === possibleSon.uniqueId) {
                return true;
            }
            if (this.isContainCycle(possibleSon, curFeature.features)) {
                return true;
            }
        }
        return false;
    }

    getFeatureInFlatListById(parentFeatureInFlatList: Array<FeatureInFlatList>, id: string) {
        for (let item of parentFeatureInFlatList) {
            if (item.feature.uniqueId === id) {
                return item;
            }
        }
        return null;
    }

    getInAppPurchaseInFlatListById(parentFeatureInFlatList: Array<InAppPurchaseInFlatList>, id: string) {
        for (let item of parentFeatureInFlatList) {
            if (item.feature.uniqueId === id) {
                return item;
            }
        }
        return null;
    }

    getInPurchaseOptionsInFlatListById(parentFeatureInFlatList: Array<PurchaseOptionsInFlatList>, id: string) {
        for (let item of parentFeatureInFlatList) {
            if (item.feature.uniqueId === id) {
                return item;
            }
        }
        return null;
    }

    getFeatureDisplayName(feature: Feature) {
        if (feature === null) {
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return feature.uniqueId;
        }

        if (feature.displayName === null || feature.displayName === undefined || feature.displayName === '') {
            return feature.name;
        } else {
            return feature.displayName;
        }

    }

    public getPollDisplayName(poll: Poll) {
        if (!poll) {
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return poll.uniqueId;
        }
        return poll.pollId;
    }
    getExperimentDisplayName(exp: Experiment) {
        if (exp === null) {
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return exp.uniqueId;
        }
        if (exp.displayName === null || exp.displayName === undefined || exp.displayName === '') {
            return exp.name;
        } else {
            return exp.displayName;
        }
    }

    getVariantDisplayName(variant: Variant) {
        if (variant === null) {
            return "";
        }
        if (FeatureUtilsService.isIdMode) {
            return variant.uniqueId;
        }
        if (variant.displayName === null || variant.displayName === undefined || variant.displayName === '') {
            return variant.name;
        } else {
            return variant.displayName;
        }
    }

    getFeatureFullName(feature: Feature) {
        if (feature === null) {
            return "";
        }
        if (/*feature.type  === "CONFIGURATION_RULE" ||*/ feature.type === "CONFIG_MUTUAL_EXCLUSION_GROUP") {
            return feature.name;
        }
        if (feature.namespace && feature.namespace.length > 0) {
            return feature.namespace + "." + feature.name;
        }
        return feature.name;
    }

    getFeatureDisplayNameInTree(feature: Feature) {
        let name: string = "";
        if (feature == null) {
            return "";
        }
        if (feature.type === "FEATURE" || feature.type === null || feature.type === undefined ||
            feature.type === "ENTITLEMENT" || feature.type === "PURCHASE_OPTIONS") {

            name = this.getFeatureDisplayName(feature);
            /*
            if(feature.displayName === null || feature.displayName === undefined || feature.displayName === ''){
                name = feature.name;
            }
            else{
                name = feature.displayName;
            }*/
        } else {
            name = "Mutual Exclusion Group";
        }
        return name;
    }

    getNameWithSpaces(feature: Feature, level: number) {
        let finalName = "-";
        let name: string = this.getFeatureDisplayNameInTree(feature);
        for (let i = 0; i < level; ++i) {
            finalName += " ";
        }
        finalName += name;
        return finalName;
    }

    addFeatureAtLevel(curFeature: Feature, parentFeature: Feature, featureInFlatList: Array<FeatureInFlatList>, curLevel: number, useConfigurationans: boolean = true) {
        featureInFlatList.push(new FeatureInFlatList(curFeature, parentFeature, curLevel, this.getNameWithSpaces(curFeature, curLevel)));
        if (curFeature.type === 'FEATURE' || curFeature.type === 'MUTUAL_EXCLUSION_GROUP') {
            for (let curSon of curFeature.features) {

                this.addFeatureAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }

        if (typeof curFeature.configurationRules !== "undefined" && useConfigurationans) {
            for (let curSon of curFeature.configurationRules) {
                this.addFeatureAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }
    }

    addInAppPurchaseAtLevel(curFeature: InAppPurchase, parentFeature: InAppPurchase, featureInFlatList: Array<InAppPurchaseInFlatList>, curLevel: number, useConfigurationans: boolean = true) {
        featureInFlatList.push(new InAppPurchaseInFlatList(curFeature, parentFeature, curLevel, this.getNameWithSpaces(curFeature, curLevel)));
        if (curFeature.type === 'ENTITLEMENT' || curFeature.type === 'ENTITLEMENT_MUTUAL_EXCLUSION_GROUP') {
            for (let curSon of curFeature.entitlements) {

                this.addInAppPurchaseAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }

        if (typeof curFeature.configurationRules !== "undefined" && useConfigurationans) {
            for (let curConf of curFeature.configurationRules) {
                this.addFeatureAtLevel(curConf, curFeature, featureInFlatList, curLevel + 1);
            }
        }
    }

    addInPurchaseOptionAtLevel(curFeature: PurchaseOptions, parentFeature: PurchaseOptions, featureInFlatList: Array<PurchaseOptionsInFlatList>, curLevel: number, useConfigurationans: boolean = true) {
        featureInFlatList.push(new PurchaseOptionsInFlatList(curFeature, parentFeature, curLevel, this.getNameWithSpaces(curFeature, curLevel)));
        if (curFeature.type === 'PURCHASE_OPTIONS' || curFeature.type === 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
            for (let curSon of curFeature.purchaseOptions) {

                this.addInPurchaseOptionAtLevel(curSon, curFeature, featureInFlatList, curLevel + 1);
            }
        }

        if (typeof curFeature.configurationRules !== "undefined" && useConfigurationans) {
            for (let curConf of curFeature.configurationRules) {
                this.addFeatureAtLevel(curConf, curFeature, featureInFlatList, curLevel + 1);
            }
        }
    }

    getDisplayNameForBothFeatureAndMX(feature: Feature) {
        if (feature.type === "MUTUAL_EXCLUSION_GROUP") {
            return this.getMXDisplayName(feature);
        } else {
            return this.getFeatureDisplayName(feature);
        }
    }

    getDisplayNameForBothPurchaseAndMX(feature: InAppPurchase) {
        if (feature.type === "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP") {
            return this.getPurchaseMXDisplayName(feature);
        } else {
            return this.getFeatureDisplayName(feature);
        }
    }

    filterEmptyMTX(features: Feature[]) {
        if (!features) {
            return features;
        }
        let filteredList = [];
        for (let feature of features) {
            if (feature.type === "MUTUAL_EXCLUSION_GROUP" && !(feature.features && feature.features.length > 0)) {

            } else {
                filteredList.push(feature);
            }
        }
        return filteredList;
    }

    getMXDisplayName(feature: Feature) {
        let sons = "";
        let items = feature.features;
        if (items != null && items.length > 0) {
            for (let item of items) {
                let subfeat: Feature = item;
                if (sons === "") {
                    sons = "Group: " + this.getFeatureDisplayName(subfeat);
                } else {
                    sons += " \\ " + this.getFeatureDisplayName(subfeat);
                }
            }
            return sons;
        } else {
            return "Empty MX";
        }
    }

    getPurchaseMXDisplayName(feature: InAppPurchase) {
        let sons = "";
        let items = feature.entitlements;
        if (items != null && items.length > 0) {
            for (let item of items) {
                let subfeat: InAppPurchase = item;
                if (sons === "") {
                    sons = "Group: " + this.getFeatureDisplayName(subfeat);
                } else {
                    sons += " \\ " + this.getFeatureDisplayName(subfeat);
                }
            }
            return sons;
        } else {
            return "Empty MX";
        }
    }

    getPurchaseOptionsMXDisplayName(feature: PurchaseOptions) {
        let sons = "";
        let items = feature.purchaseOptions;
        if (items != null && items.length > 0) {
            for (let item of items) {
                let subfeat: PurchaseOptions = item;
                if (sons === "") {
                    sons = "Group: " + this.getFeatureDisplayName(subfeat);
                } else {
                    sons += " \\ " + this.getFeatureDisplayName(subfeat);
                }
            }
            return sons;
        } else {
            return "Empty MX";
        }
    }

    getPossibleParentsInFlatList(rootFeatuteGroups: Array<Feature>, rootId: string, useConfigurationans: boolean = true) {
        let featureInFlatList: Array<FeatureInFlatList> = [];
        let rootFeature: Feature = new Feature();
        rootFeature.uniqueId = rootId;
        rootFeature.name = "ROOT";
        featureInFlatList.push(new FeatureInFlatList(rootFeature, null, -1, "Root"));
        for (let curFeature of rootFeatuteGroups) {
            this.addFeatureAtLevel(curFeature, null, featureInFlatList, 0, useConfigurationans);
        }
        return featureInFlatList;
    }

    getPossiblePurchaseParentsInFlatList(rootFeatuteGroups: Array<InAppPurchase>, rootId: string, useConfigurationans: boolean = true) {
        let featureInFlatList: Array<InAppPurchaseInFlatList> = [];
        let rootFeature: InAppPurchase = new InAppPurchase();
        rootFeature.uniqueId = rootId;
        rootFeature.name = "ROOT";
        featureInFlatList.push(new InAppPurchaseInFlatList(rootFeature, null, -1, "Root"));
        if (rootFeatuteGroups != null) {
            for (let curFeature of rootFeatuteGroups) {
                this.addInAppPurchaseAtLevel(curFeature, null, featureInFlatList, 0, useConfigurationans);
            }
        }
        return featureInFlatList;
    }

    getPossiblePurchaseOptionsParentsInFlatList(rootFeatuteGroups: Array<PurchaseOptions>, rootId: string, useConfigurationans: boolean = true) {
        let featureInFlatList: Array<PurchaseOptionsInFlatList> = [];
        let rootFeature: PurchaseOptions = new PurchaseOptions();
        rootFeature.uniqueId = rootId;
        rootFeature.name = "ROOT";
        featureInFlatList.push(new PurchaseOptionsInFlatList(rootFeature, null, -1, "Root"));
        for (let curFeature of rootFeatuteGroups) {
            this.addInPurchaseOptionAtLevel(curFeature, null, featureInFlatList, 0, useConfigurationans);
        }
        return featureInFlatList;
    }

    static compareVariants(v1: Variant[], v2: Variant[]) {
        let r1Arr = v1 || [];
        let r2Arr = v2 || [];
        if (r1Arr.length != r2Arr.length) return false;
        let length = r1Arr.length;
        for (let i = 0; i < length; ++i) {
            let curr1 = r1Arr[i];
            let curr2 = r2Arr[i];
            if ((curr1.uniqueId != curr2.uniqueId)) {
                return false;
            }
        }
        return true;
    }
    static isIndexRangeEquel(r1: IndexRange[], r2: IndexRange[]): boolean {
        let r1Arr = r1 || [];
        let r2Arr = r2 || [];
        if (r1Arr.length != r2Arr.length) return false;
        let length = r1Arr.length;
        for (let i = 0; i < length; ++i) {
            let curr1 = r1Arr[i];
            let curr2 = r2Arr[i];
            if ((curr1.start != curr2.start) ||
                (curr1.end != curr2.end)) {
                return false;
            }
        }
        return true;

    }
    static compareRules(r1: Rule, r2: Rule): boolean {
        let r1RuleStr = (r1 && r1.ruleString) ? r1.ruleString : "";
        let r2RuleStr = (r2 && r2.ruleString) ? r2.ruleString : "";
        return r1RuleStr === r2RuleStr;
    }
    static isVariantIdentical(v1: Variant, v2: Variant) {
        if (!v1 && !v2) return true;
        return v1.uniqueId === v2.uniqueId &&
            v1.name === v2.name &&
            v1.displayName === v2.displayName &&
            v1.lastModified === v2.lastModified &&
            v1.stage === v2.stage &&
            v1.description === v2.description &&
            v1.branchName === v2.branchName &&
            v1.experimentId === v2.experimentId &&
            this.compareBooleans(v1.enabled, v2.enabled) &&
            this.compareRules(v1.rule, v2.rule) &&
            v1.rolloutPercentage === v2.rolloutPercentage &&
            v1.creator === v2.creator &&
            ((v1.internalUserGroups || []).join() === (v2.internalUserGroups || []).join()) &&
            v1.creationDate === v2.creationDate;
    }

    static isCohortIdentical(c1: Cohort, c2: Cohort): boolean {
        if (!c1 && !c2) return true;
        return c1.productId === c2.productId &&
            c1.uniqueId === c2.uniqueId &&
            c1.name === c2.name &&
            c1.lastModified === c2.lastModified &&
            c1.description === c2.description &&
            this.compareBooleans(c1.enabled, c2.enabled) &&
            c1.creator === c2.creator &&
            c1.creationDate === c2.creationDate &&
            c1.queryCondition === c2.queryCondition &&
            c1.queryAdditionalValue === c2.queryAdditionalValue &&
            c1.updateFrequency === c2.updateFrequency &&
            c1.calculationStatus === c2.calculationStatus &&
            c1.calculationStatusMessage === c2.calculationStatusMessage &&
            // c1.usersNumber === c2.usersNumber &&
            ((c1.joinedTables || []).join() === (c2.joinedTables || []).join()) &&
            this.isExportsIdentical(c1.exports, c2.exports)
    }

    static isExportsIdentical(e1: { string: CohortExport }, e2: { string: CohortExport }): boolean {
        let e1Obj = e1 ? e1 : {};
        let e2Obj = e2 ? e2 : {};
        let keys1 = Object.keys(e1Obj);
        keys1.sort((a, b) =>
            a.localeCompare(b)//using String.prototype.localCompare()
        );
        let keys2 = Object.keys(e2Obj);
        keys2.sort((a, b) =>
            a.localeCompare(b)//using String.prototype.localCompare()
        );
        if ((keys1.join() !== keys2.join())) return false;
        let length = keys1.length;
        for (let i = 0; i < length; ++i) {
            let key = keys1[i];
            let currExp1: CohortExport = e1Obj[key];
            let currExp2: CohortExport = e2Obj[key];
            if (this.compareBooleans(currExp1.exportEnabled, currExp2.exportEnabled)
                && (currExp1.exportName || "") === (currExp2.exportName || "")) {
                //equal accept statuses
            } else {
                return false;
            }
        }
        return true;
    }

    static isExperimentIdentical(exp1: Experiment, exp2: Experiment) {
        return exp1.uniqueId === exp2.uniqueId &&
            exp1.productId === exp2.productId &&
            exp1.name === exp2.name &&
            exp1.displayName === exp2.displayName &&
            exp1.lastModified === exp2.lastModified &&
            exp1.stage === exp2.stage &&
            this.isIndexRangeEquel(exp1.ranges, exp2.ranges) &&
            exp1.description === exp2.description &&
            exp1.hypothesis === exp2.hypothesis &&
            exp1.measurements === exp2.measurements &&
            this.compareBooleans(exp1.enabled, exp2.enabled) &&
            exp1.minVersion === exp2.minVersion &&
            exp1.maxVersion === exp2.maxVersion &&
            this.compareRules(exp1.rule, exp2.rule) &&
            exp1.rolloutPercentage === exp2.rolloutPercentage &&
            this.compareVariants(exp1.variants, exp2.variants) &&
            exp1.creator === exp2.creator &&
            this.compareBooleans(exp1.indexExperiment, exp2.indexExperiment) &&
            exp1.creationDate === exp2.creationDate &&
            ((exp1.internalUserGroups || []).join() === (exp2.internalUserGroups || []).join()) &&
            ((exp1.controlGroupVariants || []).join() === (exp2.controlGroupVariants || []).join());
    }

    static isWebhookIdentical(w1: Webhook, w2: Webhook) {
        if (!w1 && !w2) return false;
        return w1.creator === w2.creator &&
            w1.uniqueId === w1.uniqueId &&
            w1.name === w1.name &&
            w1.lastModified === w1.lastModified &&
            w1.minStage === w1.minStage &&
            w1.creationDate === w1.creationDate &&
            this.compareBooleans(w1.sendRuntime, w2.sendRuntime) &&
            this.compareBooleans(w1.sendAdmin, w2.sendAdmin) &&
            w1.url === w1.url &&
            ((w1.products || []).join() === (w2.products || []).join());
    }
    static isNotificationIdentical(n1: AirlockNotification, n2: AirlockNotification): boolean {
        if (!n1 && !n2) return true;
        return (n1.uniqueId === n2.uniqueId) &&
            (n1.seasonId === n2.seasonId) &&
            (n1.name === n2.name) &&
            (n1.lastModified === n2.lastModified) &&
            (n1.stage === n2.stage) &&
            (n1.description === n2.description) &&
            this.compareBooleans(n1.enabled, n2.enabled) &&
            (n1.minAppVersion === n2.minAppVersion) &&
            (n1.rolloutPercentage === n2.rolloutPercentage) &&
            (n1.creator === n2.creator) &&
            (n1.creationDate === n2.creationDate) &&
            ((n1.internalUserGroups || []).join() === (n2.internalUserGroups || []).join()) &&
            (n1.owner === n2.owner) &&
            (n1.configuration === n2.configuration) &&
            this.compareRules(n1.cancellationRule, n2.cancellationRule) &&
            this.compareRules(n1.registrationRule, n2.registrationRule) &&
            this.isMaxNotificationsEquel(n1.maxNotifications, n2.maxNotifications) &&
            (n1.minInterval === n2.minInterval);
    }

    static isMaxNotificationsEquel(mn1, mn2): boolean {
        return ((mn1 === -1 && mn2 === "") ||
            (mn2 === -1 && mn1 === "") ||
            mn1 === mn2);
    }

    static isInAppPurchaseIdentical(p1: InAppPurchase, p2: InAppPurchase): boolean {
        if (!p1 && !p2) return true;
        return this.isFeatureIdentical(p1, p2) &&
            ((p1.includedEntitlements || []).join() === (p2.includedEntitlements || []).join());
    }

    static isPurchaseOptionIdentical(p1: PurchaseOptions, p2: PurchaseOptions): boolean {
        if (!p1 && !p2) return true;
        return this.isFeatureIdentical(p1, p2) &&
            ((p1.storeProductIds || []).join() === (p2.storeProductIds || []).join());
    }

    static isBasePollItemIdentical(i1: BasePoll, i2: BasePoll): boolean {
        return i1.uniqueId === i2.uniqueId &&
            i1.creator === i2.creator &&
            i1.creationDate === i2.creationDate &&
            i1.lastModified === i2.lastModified &&
            i1.stage === i2.stage &&
            this.compareBooleans(i1.enabled, i2.enabled) &&
            ((i1.internalUserGroups || []).join() === (i2.internalUserGroups || []).join()) &&
            this.compareRules(i1.rule, i2.rule) &&
            i1.rolloutPercentage === i2.rolloutPercentage &&
            (i1.description || "") === (i2.description || "");
    }

    static isStreamIdentical(s1: Stream, s2: Stream): boolean {
        if (!s1 && !s2) return true;
        return s1.uniqueId === s2.uniqueId &&
            s1.seasonId === s2.seasonId &&
            s1.name === s2.name &&
            ((s1.displayName || "") === (s2.displayName || "")) &&
            s1.lastModified === s2.lastModified &&
            s1.stage === s2.stage &&
            s1.description === s2.description &&
            this.compareBooleans(s1.enabled, s2.enabled) &&
            s1.minAppVersion === s2.minAppVersion &&
            s1.rolloutPercentage === s2.rolloutPercentage &&
            s1.creator === s2.creator &&
            s1.creationDate === s2.creationDate &&
            ((s1.internalUserGroups || []).join() === (s2.internalUserGroups || []).join()) &&
            s1.filter === s2.filter &&
            s1.maxQueuedEvents === s2.maxQueuedEvents &&
            s1.queueSizeKB === s2.queueSizeKB &&
            s1.owner === s2.owner &&
            s1.processor === s2.processor &&
            s1.resultsSchema === s2.resultsSchema &&
            this.compareBooleans(s1.operateOnHistoricalEvents, s2.operateOnHistoricalEvents) &&
            s1.processEventsOfLastNumberOfDays === s2.processEventsOfLastNumberOfDays &&
            s1.limitByEndDate === s2.limitByEndDate &&
            s1.limitByStartDate === s2.limitByStartDate;
    }
    static isPollIdentical(p1: Poll, p2: Poll): boolean {
        return this.isBasePollItemIdentical(p1, p2) &&
            p1.pollId === p2.pollId &&
            p1.productId === p2.productId &&
            (p1.title || "") === (p2.title || "") &&
            (p1.subTitle || "") === (p2.subTitle || "") &&
            (p1.minVersion || "") === (p2.minVersion || "") &&
            (p1.maxVersion || "") === (p2.maxVersion || "") &&
            p1.startDate === p2.startDate &&
            p1.endDate === p2.endDate &&
            p1.numberOfViewsBeforeDismissal === p2.numberOfViewsBeforeDismissal &&
            this.compareBooleans(p1.usedOnlyByPushCampaign, p2.usedOnlyByPushCampaign);

    }
    static isVisualizationIdentical(v1: Visualization, v2: Visualization): boolean {
        if (!v1 && !v2) return true;
        return (v1.type || "") === (v2.type || "") &&
            v1.additionalMarkup === v2.additionalMarkup;
    }
    static isQuestionIdentical(q1: Question, q2: Question): boolean {
        return this.isBasePollItemIdentical(q1, q2) &&
            q1.pollId === q2.pollId &&
            q1.questionId === q2.questionId &&
            this.compareBooleans(q1.pi, q2.pi) &&
            (q1.title || "") === (q2.title || "") &&
            (q1.dynamicTitle || "") === (q2.dynamicTitle || "") &&
            q1.maxAnswers === q2.maxAnswers &&
            q1.type === q2.type &&
            this.isVisualizationIdentical(q1.visualization, q2.visualization) &&
            this.compareBooleans(q1.correctIncorrect, q2.correctIncorrect) &&
            this.compareBooleans(q1.shuffleAnswers, q2.shuffleAnswers) &&
            this.compareBooleans(q1.multipleAnswers, q2.multipleAnswers) &&
            (q1.userAttribute || "") === (q2.userAttribute || "") &&
            (q1.dbColumn || "") === (q2.dbColumn || "") &&
            (q1.dynamicQuestionSubmitText || "") === (q2.dynamicQuestionSubmitText || "");

    }
    static isPredefinedAnswerIdentical(a1: PredefinedAnswer, a2: PredefinedAnswer) {
        /*
        title: string;
    dynamicTitle: string;
    correctAnswer: boolean;
    onAnswerGoto: string;
    answerId: string;
    enabled: boolean;
         */
        return (a1.title || "") === (a2.title || "") &&
            (a1.dynamicTitle || "") === (a2.dynamicTitle || "") &&
            this.compareBooleans(a1.correctAnswer, a2.correctAnswer) &&
            (a1.onAnswerGoto || "") === (a2.onAnswerGoto || "") &&
            (a1.answerId || "") === (a2.answerId || "") &&
            this.compareBooleans(a1.enabled, a2.enabled);
    }

    static isOpenAnswerIdentical(a1: OpenAnswer, a2: OpenAnswer) {
        /*
        title: string;
    dynamicTitle: string;
    onAnswerGoto: string;
    type: string;
    userAttribute: string;
    enabled: boolean;
         */
        return (a1.title || "") === (a2.title || "") &&
            (a1.dynamicTitle || "") === (a2.dynamicTitle || "") &&
            (a1.userAttribute || "") === (a2.userAttribute || "") &&
            (a1.onAnswerGoto || "") === (a2.onAnswerGoto || "") &&
            (a1.type || "") === (a2.type || "") &&
            this.compareBooleans(a1.enabled, a2.enabled);
    }

    static isFeatureIdentical(feature1: Feature, feature2: Feature): boolean {
        /*if (feature1.name !== feature2.name) {
            console.log("name not identical");
        }
        if (feature1.namespace !== feature2.namespace) {
            console.log("namespace not identical");
        }
        if (!(this.compareBooleans(feature1.enabled, feature2.enabled))) {
            console.log("enabled not identical");
        }
        if (feature1.noCachedResults !== feature2.noCachedResults) {
            console.log("noCachedResults not identical");
        }
        if (feature1.lastModified !== feature2.lastModified) {
            console.log("lastModified not identical");
        }
        if (feature1.parent !== feature2.parent) {
            console.log("parent not identical");
        }
        if (feature1.type !== feature2.type) {
            console.log("type not identical");
        }
        if (feature1.stage !== feature2.stage) {
            console.log("stage not identical");
        }
        if (feature1.additionalInfo !== feature2.additionalInfo) {
            console.log("additionalInfo not identical");
        }
        if (feature1.creator !== feature2.creator) {
            console.log("creator not identical");
        }
        if (feature1.creationDate !== feature2.creationDate) {
            console.log("creationDate not identical");
        }
        if (feature1.internalUserGroups.join() !== feature2.internalUserGroups.join()) {
            console.log("internalUserGroups not identical");
        }
        if (feature1.isCurrentUserFollower !== feature2.isCurrentUserFollower) {
            console.log("isCurrentUserFollower not identical");
        }
        if (feature1.description !== feature2.description) {
            console.log("description not identical");
        }
        if (feature1.rule.ruleString !== feature2.rule.ruleString) {
            console.log("rule.ruleString not identical");
        }
        if (feature1.minAppVersion !== feature2.minAppVersion) {
            console.log("name not identical");
        }
        if (feature1.displayName !== feature2.displayName) {
            console.log("displayName not identical");
        }
        if (feature1.seasonId !== feature2.seasonId) {
            console.log("seasonId not identical");
        }
        if (feature1.owner !== feature2.owner) {
            console.log("owner not identical");
        }
        if (
            (!feature1.defaultConfiguration && !feature2.defaultConfiguration) ||
            (!feature1.defaultConfiguration && feature1.defaultConfiguration === "{}") ||
            (!feature2.defaultConfiguration && feature1.defaultConfiguration === "{}") ||
            (feature1.defaultConfiguration && feature2.defaultConfiguration && feature1.defaultConfiguration === feature2.defaultConfiguration)
        ) {
            //console.log("configSchema identical");
        } else {
            console.log("defaultConfiguration not identical");
        }

        if (!feature1.configurationSchema) {
            //console.log("f1 no configSchema");
        }
        if (!feature2.configurationSchema) {
            //console.log("f2 no configSchema");
        }
        if (
            (!feature1.configurationSchema && !feature2.configurationSchema) ||
            (!feature1.configurationSchema && JSON.stringify(feature1.configurationSchema) === "{}") ||
            (!feature2.configurationSchema && JSON.stringify(feature1.configurationSchema) === "{}") ||
            (feature1.configurationSchema && feature2.configurationSchema && JSON.stringify(feature1.configurationSchema) === JSON.stringify(feature2.configurationSchema))
        ) {
            //console.log("configSchema identical");
        } else {
            console.log("configurationSchema not identical");
        }
        if (feature1.configuration !== feature2.configuration) {
            console.log("configuration not identical");
        }
        if (!(this.compareBooleans(feature1.defaultIfAirlockSystemIsDown, feature2.defaultIfAirlockSystemIsDown))) {
            console.log("defaultIfAirlockSystemIsDown not identical");
            console.log("f1:" + feature1.defaultIfAirlockSystemIsDown);
            console.log("f2:" + feature2.defaultIfAirlockSystemIsDown);
        }
        if (feature1.rolloutPercentage !== feature2.rolloutPercentage) {
            console.log("rolloutPercentage not identical");
        }
        if (feature1.rolloutPercentageBitmap !== feature2.rolloutPercentageBitmap) {
            console.log("rolloutPercentageBitmap not identical");
        }
        if (feature1.maxFeaturesOn !== feature2.maxFeaturesOn) {
            console.log("maxFeaturesOn not identical");
        }
        if (feature1.branchStatus !== feature2.branchStatus) {
            console.log("branchStatus not identical");
        }
        if (!(this.compareBooleans(feature1.sendToAnalytics, feature2.sendToAnalytics))) {
            console.log("sendToAnalytics not identical");
        }
        if (!(
            (!feature1.configAttributesToAnalytics && !feature2.configAttributesToAnalytics) ||
            (!feature1.configAttributesToAnalytics && feature2.configAttributesToAnalytics.length <= 0) ||
            (!feature2.configAttributesToAnalytics && feature1.configAttributesToAnalytics.length <= 0) ||
            (feature1.configAttributesToAnalytics && feature2.configAttributesToAnalytics && feature1.configAttributesToAnalytics.join() === feature2.configAttributesToAnalytics.join())
        )) {
            console.log("configAttributesToAnalytics not identical");
        }
        if (!(this.compareBooleans(feature1.premium, feature2.premium))) {
            console.log("premium not identical");
        }
        if (feature1.entitlement !== feature2.entitlement) {
            console.log("entitlement not identical");
        }
        if (!(
            (!feature1.premiumRule && !feature2.premiumRule) ||
            (feature1.premiumRule.ruleString === feature2.premiumRule.ruleString)
        )) {
            console.log("premiumRule.ruleString not identical");
        }*/
        return feature1.name === feature2.name &&
            feature1.uniqueId === feature2.uniqueId &&
            feature1.namespace === feature2.namespace &&
            this.compareBooleans(feature1.enabled, feature2.enabled) &&
            this.compareBooleans(feature1.noCachedResults, feature2.noCachedResults) &&
            feature1.lastModified === feature2.lastModified &&
            feature1.parent === feature2.parent &&
            feature1.type === feature2.type &&
            feature1.stage === feature2.stage &&
            feature1.additionalInfo === feature2.additionalInfo &&
            feature1.creator === feature2.creator &&
            feature1.creationDate === feature2.creationDate &&
            (
                (!feature1.internalUserGroups && !feature2.internalUserGroups) ||
                (feature1.internalUserGroups.join() === feature2.internalUserGroups.join())
            ) &&
            this.compareBooleans(feature1.isCurrentUserFollower, feature2.isCurrentUserFollower) &&
            feature1.description === feature2.description &&
            feature1.rule.ruleString === feature2.rule.ruleString &&
            feature1.minAppVersion === feature2.minAppVersion &&
            feature1.displayName === feature2.displayName &&
            feature1.seasonId === feature2.seasonId &&
            feature1.owner === feature2.owner &&
            (
                (!feature1.defaultConfiguration && !feature2.defaultConfiguration) ||
                (!feature1.defaultConfiguration && feature1.defaultConfiguration === "{}") ||
                (!feature2.defaultConfiguration && feature1.defaultConfiguration === "{}") ||
                (feature1.defaultConfiguration && feature2.defaultConfiguration && feature1.defaultConfiguration === feature2.defaultConfiguration)
            ) &&
            (
                (!feature1.configurationSchema && !feature2.configurationSchema) ||
                (!feature1.configurationSchema && JSON.stringify(feature1.configurationSchema) === "{}") ||
                (!feature2.configurationSchema && JSON.stringify(feature1.configurationSchema) === "{}") ||
                (feature1.configurationSchema && feature2.configurationSchema && JSON.stringify(feature1.configurationSchema) === JSON.stringify(feature2.configurationSchema))
            ) &&
            feature1.configuration === feature2.configuration &&
            this.compareBooleans(feature1.defaultIfAirlockSystemIsDown, feature2.defaultIfAirlockSystemIsDown) &&
            feature1.rolloutPercentage === feature2.rolloutPercentage &&
            feature1.rolloutPercentageBitmap === feature2.rolloutPercentageBitmap &&
            feature1.maxFeaturesOn === feature2.maxFeaturesOn &&
            feature1.branchStatus === feature2.branchStatus &&
            this.compareBooleans(feature1.sendToAnalytics, feature2.sendToAnalytics) &&
            (
                (!feature1.configAttributesToAnalytics && !feature2.configAttributesToAnalytics) ||
                (!feature1.configAttributesToAnalytics && feature2.configAttributesToAnalytics.length <= 0) ||
                (!feature2.configAttributesToAnalytics && feature1.configAttributesToAnalytics.length <= 0) ||
                (feature1.configAttributesToAnalytics && feature2.configAttributesToAnalytics && feature1.configAttributesToAnalytics.join() === feature2.configAttributesToAnalytics.join())
            ) &&
            this.compareBooleans(feature1.premium, feature2.premium) &&
            feature1.entitlement === feature2.entitlement &&
            (
                (!feature1.premiumRule && !feature2.premiumRule) ||
                ((feature1.premiumRule && feature2.premiumRule) && (feature1.premiumRule.ruleString === feature2.premiumRule.ruleString))
            );

    }
    static compareBooleans(b1: boolean, b2: boolean) {
        let toRet = (!!b1 == !!b2);
        return toRet;
    }
    static isVersionSmaller(version: string, versionToCompare: string): boolean {
        if (version === versionToCompare) {
            return false;
        }
        let versionArr = version.split('.');
        let versionToCompareArr = versionToCompare.split('.');
        let maxNum = Math.max(versionArr.length, versionToCompareArr.length);
        for (let i = 0; i < maxNum; i++) {
            let versionNum = 0;
            if (i < versionArr.length) {
                versionNum = Number(versionArr[i]);
            }
            let versionToCompareNum = 0;
            if (i < versionToCompareArr.length) {
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
        if (feature.type === "ENTITLEMENT" || feature.type === "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP") {
            return InAppPurchase.clone(feature as InAppPurchase);
        } else if (feature.type === "PURCHASE_OPTIONS" || feature.type === "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") {
            return PurchaseOptions.clone(feature as PurchaseOptions);
        } else {
            return Feature.clone(feature);
        }
    }

}

export class FeatureInFlatList {
    constructor(public feature: Feature, public parent: Feature, public level: number, public displayString: string) {
    }
}

export class InAppPurchaseInFlatList extends FeatureInFlatList {
    constructor(public feature: InAppPurchase, public parent: InAppPurchase, public level: number, public displayString: string) {
        super(feature, parent, level, displayString);
    }
}

export class PurchaseOptionsInFlatList extends FeatureInFlatList {
    constructor(public feature: PurchaseOptions, public parent: PurchaseOptions, public level: number, public displayString: string) {
        super(feature, parent, level, displayString);
    }
}
