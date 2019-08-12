/**
 * Created by elikkatz on 19/01/2017.
 */
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './experiments.routing';
import { ProgressbarModule } from 'ng2-bootstrap';
import { TabsModule } from 'ng2-bootstrap/tabs';
import {FeatureCell} from "../../theme/airlock.components/featureCell/featureCell.component";
import {AddConfigurationModal} from "../../theme/airlock.components/addConfigurationModal/addConfigurationModal.component";
import {AddFeatureToGroupModal} from "../../theme/airlock.components/addFeatureToGroupModal/addFeatureToGroupModal.component";
import {ReorderMXGroupModal} from "../../theme/airlock.components/reorderMXGroupModal/reorderMXGroupModal.component";
import {AddFeatureModal} from "../../theme/airlock.components/addFeatureModal/addFeatureModal.component";
import {EditFeatureModal} from "../../theme/airlock.components/editFeatureModal/editFeatureModal.component";
import {ExperimentsPage} from "./experiments.component";
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
import ALCommonsModule from "../common.module";
import { PopoverModule } from 'ng2-bootstrap';
import {InputTextModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import {DataTableModule,SharedModule} from 'primeng/primeng';
import {SelectModule} from "ng2-select";

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
import FeaturesModule from "../featuresPage/features.module";
import {ExperimentCell} from "../../theme/airlock.components/experimentCell/experimentCell.component";
import {AddExperimentModal} from "../../theme/airlock.components/addExperimentModal/addExperimentModal.component";
import {EditExperimentModal} from "../../theme/airlock.components/editExperimentModal/editExperimentModal.component";
import {EditVariantModal} from "../../theme/airlock.components/editVariantModal/editVariantModal.component";
import {AddVariantModal} from "../../theme/airlock.components/addVariantModal/addVariantModal.component";
import {VariantCell} from "../../theme/airlock.components/variantCell/variantCell.component";
import {FlaskIcon} from "../../theme/airlock.components/flaskIcon/flaskIcon.component";
import {ReorderExperimentsModal} from "../../theme/airlock.components/reorderExperimentsModal/reorderExperimentsModal.component";
import {ReorderVariantsModal} from "../../theme/airlock.components/reorderVariantsModal/reorderVariantsModal.component";
import {ShowDashboardModal} from "../../theme/airlock.components/showDashboardModal/showDashboardModal.component";

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

    ],
    declarations: [
        ExperimentsPage,
        ExperimentCell,
        AddExperimentModal,
        EditExperimentModal,
        EditVariantModal,
        AddVariantModal,
        VariantCell,
        FlaskIcon,
        ReorderExperimentsModal,
        ReorderVariantsModal,
        ShowDashboardModal
    ],
    providers: [
        // TransparentSpinner,
        // NotificationsService,
        // FeatureUtilsService,

    ]
})
export default class ExperimentsModule {}
