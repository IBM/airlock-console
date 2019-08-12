/**
 * Created by elikkatz on 19/01/2017.
 */
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './translations.routing';
import { ProgressbarModule } from 'ng2-bootstrap';
import { TabsModule } from 'ng2-bootstrap/tabs';
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {FeatureCell} from "../../theme/airlock.components/featureCell/featureCell.component";
import {AddConfigurationModal} from "../../theme/airlock.components/addConfigurationModal/addConfigurationModal.component";
import {AddFeatureToGroupModal} from "../../theme/airlock.components/addFeatureToGroupModal/addFeatureToGroupModal.component";
import {ReorderMXGroupModal} from "../../theme/airlock.components/reorderMXGroupModal/reorderMXGroupModal.component";
import {CustomAirlockHeader} from "../../theme/airlock.components/customAirlockHeader/customAirlockHeader.component";
import {AddFeatureModal} from "../../theme/airlock.components/addFeatureModal/addFeatureModal.component";
import {EditFeatureModal} from "../../theme/airlock.components/editFeatureModal/editFeatureModal.component";
import { TranslationsPage} from "./translations.component";
import {AceModal} from "../../theme/airlock.components/aceModal/aceModal.component";
import {AceEditor} from "../../theme/airlock.components/aceEditor/aceEditor";
import {NotificationsService} from "angular2-notifications";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {UiSwitchComponent} from "angular2-ui-switch/dist/ui-switch.component";
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
import {AddStringModal} from "../../theme/airlock.components/addStringModal/addStringModal.component";
import {StringsMasterDetail} from "./components/stringsMasterDetailView/strings.master.detail.component";
import {StringList} from "./components/stringsMasterDetailView/stringsList/strings.list.component";
import {StringsTableView} from "./components/stringsTableView/strings.table.component.ts";
import {StringDetail} from "./components/stringsMasterDetailView/stringsDetail/strings.detail.component";
import {OverrideStringModal} from "../../theme/airlock.components/overrideStringModal/overrideStringModal.component";
import {StringIssueModal} from "../../theme/airlock.components/stringIssueModal/stringIssueModal.component";
import {DataTableModule} from "angular2-datatable";
import {MarkForTranslationModal} from "../../theme/airlock.components/markForTranslationModal/markForTranslationModal.component";
import {EditStringModal} from "../../theme/airlock.components/editStringModal/editStringModal.component";
import {StringStatus} from "../../theme/airlock.components/stringStatus/stringStatus.component";
import {CreateIssueModal} from "../../theme/airlock.components/createIssueModal/createIssueModal.component";
import {StringUsageModal} from "../../theme/airlock.components/stringUsageModal/stringUsageModal.component";
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
        PushNotificationsModule,ALCommonsModule,
        DataTableModule,
        routing,
    ],
    declarations: [
        TranslationsPage,AddStringModal,StringsMasterDetail,StringList,StringDetail,OverrideStringModal,StringsTableView,MarkForTranslationModal,
        EditStringModal,StringStatus,StringIssueModal,CreateIssueModal,StringUsageModal
    ],
    providers: [
        FeatureUtilsService,

    ]
})
export default class TranslationsModule {}