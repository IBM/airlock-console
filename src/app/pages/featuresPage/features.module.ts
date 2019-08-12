/**
 * Created by elikkatz on 19/01/2017.
 */
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './features.routing';
import { ProgressbarModule } from 'ng2-bootstrap';
import { TabsModule } from 'ng2-bootstrap/tabs';
import {FeatureCell} from "../../theme/airlock.components/featureCell/featureCell.component";
import {AddConfigurationModal} from "../../theme/airlock.components/addConfigurationModal/addConfigurationModal.component";
import {AddFeatureToGroupModal} from "../../theme/airlock.components/addFeatureToGroupModal/addFeatureToGroupModal.component";
import {ReorderMXGroupModal} from "../../theme/airlock.components/reorderMXGroupModal/reorderMXGroupModal.component";
import {AddFeatureModal} from "../../theme/airlock.components/addFeatureModal/addFeatureModal.component";
import {EditFeatureModal} from "../../theme/airlock.components/editFeatureModal/editFeatureModal.component";
import {FeaturesPage} from "./featuresPage.component";
//import {UiSwitchComponent} from "angular2-ui-switch/dist/ui-switch.component";
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {ModalModule} from "angular2-modal/";
import {ConfigurationCell} from "../../theme/airlock.components/configurationCell/configurationCell.component";
import { DropdownModule } from 'ng2-bootstrap';
import { TooltipModule } from 'ng2-bootstrap';
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import { AccordionModule } from 'ng2-bootstrap';
import { ButtonsModule } from 'ng2-bootstrap';
import { AlertModule } from 'ng2-bootstrap';
import {HirarchyTree} from "../../theme/airlock.components/hirarchyTree/hirarchyTree.component";
import {HirarchyNode} from "../../theme/airlock.components/hirarchyTree/hirarchyNode/hirarchyNode.component";
import {SimpleNotificationsModule, PushNotificationsModule} from 'angular2-notifications';
import { PopoverModule } from 'ng2-bootstrap';
import {InputTextModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import {DataTableModule,SharedModule} from 'primeng/primeng';

import {ImportFeaturesModal} from "../../theme/airlock.components/importFeaturesModal/importFeaturesModal.component";
import { DropdownMultiselectModule } from 'ng2-dropdown-multiselect';
import { BrowserModule } from '@angular/platform-browser';
import {WhitelistSummary} from "../wlpreview/wlsummary.component";
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {wlAttributesModal} from "../../theme/airlock.components/wlAttributesModal/wlAttributesModal.component";
import {wlContextModal} from "../../theme/airlock.components/wlContextModal/wlContextModal.component";
import {TreeModule,TreeNode} from 'primeng/primeng';
import {Accordion, AccordionGroup, WhitelistAttributes} from "../wlattributes/wlattributes.component";
import {InlineEditComponent} from "../wlattributes/inlinedit/inline-edit.component";
import {VerifyRemoveFromBranchModal} from "../../theme/airlock.components/verifyRemoveFromBranchModal/verifyRemoveFromBranchModal.component";
import {OrderCell} from "../../theme/airlock.components/orderCell/orderCell.component";
import {ShowEncryptionKeyModal} from "../../theme/airlock.components/showEncryptionKeyModal";
import {ClipboardModule} from "angular2-clipboard";
import {SelectModule} from "ng2-select";
import FeaturesCommonModule from "../features.common.module";
import ALCommonsModule from "../common.module";
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        Ng2Bs3ModalModule,
        PopoverModule.forRoot(),
        ProgressbarModule.forRoot(),
        DropdownModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        SimpleNotificationsModule,
        DropdownMultiselectModule,
        PushNotificationsModule,ALCommonsModule,
        routing,
        InputTextModule,
        ListboxModule,
        DataTableModule,
        TreeModule,
        SelectModule,
        ClipboardModule,
        FeaturesCommonModule

    ],
    declarations: [
        FeatureCell,
        AddFeatureModal,
        FeaturesPage,
        ImportFeaturesModal,
    ],
    providers: [
        // TransparentSpinner,
        // NotificationsService,
        // FeatureUtilsService,

    ],
    exports: [
        FeatureCell,
        /*UiSwitchComponent,*/
        AddFeatureModal,
        FeaturesPage,
        ImportFeaturesModal,
    ]
})
export default class FeaturesModule {}
