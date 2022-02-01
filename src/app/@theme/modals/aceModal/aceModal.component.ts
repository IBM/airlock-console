import {Component, EventEmitter, Output} from '@angular/core';
import {AceExpandDialogType} from "../../../app.module";


@Component({
    selector: 'ace-modal',
    templateUrl: './aceModal.html',
    styleUrls: ['./aceModal.scss'],
})
export class AceModal {
    @Output() outputEventFeatureRuleUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventFeaturePremiumRuleUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventconfigurationSchemaUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventdefaultConfigUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventoutputConfigUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventInputSchemaUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventFilterUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventProcessorUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventStreamSchemaUpdate: EventEmitter<any> = new EventEmitter();
    @Output() outputEventNotificationCancellationRule: EventEmitter<any> = new EventEmitter();
    @Output() outputEventNotificationRegistrationRule: EventEmitter<any> = new EventEmitter();
    private componentMsg: string;
    expandDialogTitle: string;
    public messageIsVisible: boolean;
    aceEditorContainerHeight: string; // = "650px";
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    isEditorReadOnly: boolean = false;

    aceEditorExpandContent: string;
    aceModalDialogType: AceExpandDialogType;
    aceModalWidth: string;
    isSQL: boolean;

    showAceModal(msg: string, title, ruleInputSchemaSample: string, ruleUtilitiesInfo: string, dialogType: AceExpandDialogType, isOnlyDisplayMode: boolean, isSQL: boolean = false) {
        this.aceModalDialogType = dialogType;
        this.expandDialogTitle = title;
        this.componentMsg = msg;
        this.ruleInputSchemaSample = ruleInputSchemaSample;
        this.ruleUtilitiesInfo = ruleUtilitiesInfo;
        this.isSQL = isSQL;
        this.calculateModalSize();
        if (this.aceModalDialogType == AceExpandDialogType.REFERENCE_SCHEMA || isOnlyDisplayMode)
            this.isEditorReadOnly = true;
        else
            this.isEditorReadOnly = false;
        this.messageIsVisible = true;
    }

    calculateModalSize() {
        var marginW = 50;
        var marginH = 250;
        var modalWidth = document.documentElement.clientWidth - marginW;
        this.aceModalWidth = (document.documentElement.clientWidth - marginW).toString() + 'px';
        this.aceEditorContainerHeight = (document.documentElement.clientHeight - marginH - 40 ).toString() + 'px';
    };

    closeAndSaveDialog() {
        switch (this.aceModalDialogType) {
            case AceExpandDialogType.FEATURE_RULE:
                this.outputEventFeatureRuleUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.FEATURE_PREMUIM_RULE:
                this.outputEventFeaturePremiumRuleUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.CONFIG_SCHEMA:
                this.outputEventconfigurationSchemaUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.DEFAULT_CONFIG:
                this.outputEventdefaultConfigUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.REFERENCE_SCHEMA:
                break;
            case AceExpandDialogType.OUTPUT_CONFIG:
                this.outputEventoutputConfigUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.INPUT_SCHEMA:
                this.outputEventInputSchemaUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.STREAM_FILTER:
                this.outputEventFilterUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.STREAM_PROCESSOR:
                this.outputEventProcessorUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.STREAM_SCHEMA:
                this.outputEventStreamSchemaUpdate.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.NOTIFICATION_CANCELLATION_RULE:
                this.outputEventNotificationCancellationRule.emit(this.aceEditorExpandContent);
                break;
            case AceExpandDialogType.NOTIFICATION_REGISTRATION_RULE:
                this.outputEventNotificationRegistrationRule.emit(this.aceEditorExpandContent);
                break;
            default:
                console.log('Failed to handle event. The Ace Modal Expand dialog type is unknown.')
                break;
        }

        this.messageIsVisible = false;
    }

    closeDontSaveDialog() {
        this.messageIsVisible = false;
    }

    expandedRuleUpdated(event) {
        console.log(event);
    }

    setAceEditorModalContent(event) {
        this.aceEditorExpandContent = event;
    }

}
