/**
 * Created by elikkatz on 19/01/2017.
 */
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {ModalModule} from "angular2-modal/";
import {DropdownModule, ProgressbarModule, TabsModule} from 'ng2-bootstrap';
import { TooltipModule } from 'ng2-bootstrap';
import { AccordionModule } from 'ng2-bootstrap';
import { ButtonsModule } from 'ng2-bootstrap';
import { AlertModule } from 'ng2-bootstrap';
import {SimpleNotificationsModule, PushNotificationsModule} from 'angular2-notifications';
import { PopoverModule } from 'ng2-bootstrap';
import {InputTextModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import {DataTableModule,SharedModule} from 'primeng/primeng';

import { DropdownMultiselectModule } from 'ng2-dropdown-multiselect';
import {TreeModule,TreeNode} from 'primeng/primeng';
import {OrderCell} from "../theme/airlock.components/orderCell/orderCell.component";
import {ClipboardModule} from "angular2-clipboard";
import {SelectModule} from "ng2-select";
import {NgaModule} from "../theme/nga.module";
import {ReorderMXGroupModal} from "../theme/airlock.components/reorderMXGroupModal";
import {ConfigurationCell} from "../theme/airlock.components/configurationCell/configurationCell.component";
import {AddConfigurationModal} from "../theme/airlock.components/addConfigurationModal";
import {wlAttributesModal} from "../theme/airlock.components/wlAttributesModal";
import {HirarchyTree} from "../theme/airlock.components/hirarchyTree/hirarchyTree.component";
import {wlContextModal} from "../theme/airlock.components/wlContextModal";
import {Accordion, AccordionGroup, WhitelistAttributes} from "./wlattributes/wlattributes.component";
import {HirarchyNode} from "../theme/airlock.components/hirarchyTree/hirarchyNode/hirarchyNode.component";
import {VerifyRemoveFromBranchModal} from "../theme/airlock.components/verifyRemoveFromBranchModal";
import ALCommonsModule from "./common.module";
import {WhitelistSummary} from "./wlpreview/wlsummary.component";
import {ShowEncryptionKeyModal} from "../theme/airlock.components/showEncryptionKeyModal";
import {InlineEditComponent} from "./wlattributes/inlinedit/inline-edit.component";
import {AddFeatureToGroupModal} from "../theme/airlock.components/addFeatureToGroupModal";
import {EditFeatureModal} from "../theme/airlock.components/editFeatureModal";
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
        InputTextModule,
        ListboxModule,
        DataTableModule,
        TreeModule,
        SelectModule,
        ClipboardModule

    ],
    declarations: [
        OrderCell,
        ReorderMXGroupModal,
        ConfigurationCell,
        AddConfigurationModal,
        HirarchyNode,
        HirarchyTree,
        WhitelistSummary,
        wlAttributesModal,
        wlContextModal,
        WhitelistAttributes,
        Accordion,
        AccordionGroup,
        InlineEditComponent,
        VerifyRemoveFromBranchModal,
        ShowEncryptionKeyModal,
        AddFeatureToGroupModal,
        EditFeatureModal,
    ],
    providers: [
        // TransparentSpinner,
        // NotificationsService,
        // FeatureUtilsService,

    ],
    exports: [
        OrderCell,
        ReorderMXGroupModal,
        ConfigurationCell,
        AddConfigurationModal,
        HirarchyNode,
        HirarchyTree,
        WhitelistSummary,
        wlAttributesModal,
        wlContextModal,
        WhitelistAttributes,
        Accordion,
        AccordionGroup,
        InlineEditComponent,
        VerifyRemoveFromBranchModal,
        AddFeatureToGroupModal,
        ShowEncryptionKeyModal,
        EditFeatureModal
    ]
})
export default class FeaturesCommonModule {}
