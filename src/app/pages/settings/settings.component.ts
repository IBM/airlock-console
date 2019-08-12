/**
 * Created by yoavmac on 01/08/2016.
 */

import {Component, ViewEncapsulation, OnInit} from '@angular/core';

import { AirlockService } from '../../services/airlock.service'
import { Product } from '../../model/product'
import { Feature } from '../../model/feature'
import { Rule } from '../../model/rule'
import { UserGroups } from '../../model/user-groups'

@Component({
    selector: 'settings',
    pipes: [],
    directives: [],
    providers: [],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./settings.scss')],
    template: require('./settings.html')
})
export class Settings implements OnInit {

    _products : Product[] = [];
    _features : Feature[] = [];
    _feature  : Feature;
    _userGroups : UserGroups;
    _root : Feature;
    constructor(private airlockService : AirlockService) {
    }

    ngOnInit() {
    }

    getProducts(){

        this.airlockService.getProducts().then(result => {
            this._products = result;
            console.log(`${this._products.length}`);
        });
    }

    getFeatures(){

        this.airlockService.getFeatures(this._products[0].seasons[0]).then(result => {
            this._features = result.features;
            this._root= result;
            console.log(`${this._features[0].type}`);
        });
    }

    getFeature() {

        this.airlockService.getFeature(this._features[0].uniqueId).then(result => {
            this._feature = result;
            console.log(`${this._feature.uniqueId}`);
        });
    }

    updateFeature() {
        this._feature.name = `${this._feature.name}ZZ`;

        this.airlockService
            .updateFeature(this._feature)
            .then(feature => {
                console.log(`BEFORE: ${feature.description}`);
                this._feature = feature;
                console.log(`New name: ${this._feature.name}`);
                console.log(`Test: ${this._feature.description}`);
            })
            .catch(error => console.log(`${error}`));
    }

    addFeature() {

        let newFeature : Feature = new Feature();
        newFeature.name = "shiki1";
        newFeature.namespace = "console_ns1";
        newFeature.enabled = true;
        newFeature.type = "FEATURE";
        newFeature.stage = "DEVELOPMENT";

        let r : Rule = new Rule();
        r.ruleString = "stam123";

        newFeature.rule = r;
        newFeature.internalUserGroups = ['DEV', 'QA'];

        this.airlockService
            .addFeature(newFeature, this._products[0].seasons[0].uniqueId,this._root.uniqueId)
            .then(res => {
                console.log(`New feature ID: ${res.uniqueId}`);
            })
            .catch(error => console.log(`${error}`));
    }

    getUserGroups() {
        this.airlockService.getUserGroups().then(result => {
            this._userGroups = result;
            console.log(`${this._userGroups.internalUserGroups.length}`);
        });
    }

    getAllFeatures() {

        let features : Feature[] = [];
        this.airlockService.getAllFeatures().then(result => {
            features = result;
            console.log(`${features.length}`);
        });
    }
}
