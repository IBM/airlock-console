import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {AuthorizationService} from "../../../services/authorization.service";

@Component({
    selector: 'hirarchy-tree',
    styleUrls: ['./hirarchyTree.scss'],
    templateUrl: './hirarchyTree.html'
})
export class HirarchyTree {
    @Input() feature: Feature;
    @Input() showAll: boolean = false;
    @Input() markedFeatureId: string = null;
    @Input() readonly: boolean = false;
    @Input() root: Feature;
    @Input() featureType: string = 'FEATURE';
    @Input() mtxType: string = 'MUTUAL_EXCLUSION_GROUP';

    _featurePath: Array<Feature>;
    @Input('featurePath')
    set featurePath(value: Array<Feature>) {
        this._featurePath = value;
        if (value && value.length > 0) {
            this.currentFather = this._featurePath[this._featurePath.length - 1];
        } else {
            if (!this.showAll) {
                this.currentFather = this.root;
            }
        }
    }

    @Input() openFeatures: Array<string> = [];
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onNewFatherSelected: EventEmitter<Feature> = new EventEmitter<Feature>();

    currentFather: Feature;

    constructor(private _airlockService: AirlockService, private authorizationService: AuthorizationService
    ) {

    }

    setCurrentFather(newFather: Feature) {
        if (this.readonly) {
            return;
        }
        this.currentFather = newFather;
        this.onNewFatherSelected.emit(this.currentFather);
    }

    ngOnInit() {
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

    doNothing() {

    }


    public myFeatureChangedStatus(obj: string) {
        if (this.readonly) {
            return;
        }
        this.onCellClick.emit(obj);
    }

    isCellOpen(featureID: string): boolean {
        // var index = this.featurePath.indexOf(featureID, 0);
        // if (index > -1) {
        //     return true;
        // } else {
        //     return false;
        // }
        return false;
    }

    public myOnUpdate(obj: any) {
    }

    changeStage() {

    }
}
