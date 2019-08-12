import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import {DropdownModule, TooltipModule} from 'ng2-bootstrap';
import { AccordionModule } from 'ng2-bootstrap';
import {AirlockTooltip} from "../theme/airlock.components/airlockTooltip/airlockTooltip.component";
import {NgaModule} from "../theme/nga.module";
import {SimpleNotificationsModule} from "angular2-notifications/lib/simple-notifications.module";
import { PopoverModule } from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
//import {whiteListABModal} from "../theme/airlock.components/whiteListABModal/whiteListABModal.component";
import {UiSwitchComponent} from "angular2-ui-switch/dist/ui-switch.component";
import {TreeModule,TreeNode} from 'primeng/primeng';
import {ShowMessageModal} from "../theme/airlock.components/showMessageModal/showMessageModal.component";
import {AceModal} from "../theme/airlock.components/aceModal/aceModal.component";
import {AceEditor} from "../theme/airlock.components/aceEditor/aceEditor";
import {FeatureUtilsService} from "../services/featureUtils.service";
import {TransparentSpinner} from "../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {EditInputSchemaModal} from "../theme/airlock.components/editInputSchemaModal/editInputSchemaModal.component";
import {DocumentlinksModal} from "../theme/airlock.components/documentlinksModal/documentlinksModal.component";
import {CustomAirlockHeader} from "../theme/airlock.components/customAirlockHeader/customAirlockHeader.component";
import { DropdownMultiselectModule } from 'ng2-dropdown-multiselect';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import {VerifyActionModal} from "../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {SelectModule} from "ng2-select";
import {EditBranchModal} from "../theme/airlock.components/editBranchModal/editBranchModal.component";
import {ShowConflictsModal} from "../theme/airlock.components/showConflictsModal/showConflictsModal.component";
import {ImportStringsModal} from "../theme/airlock.components/importStringsModal/importStringsModal.component";
import {EditUtilityModal} from "../theme/airlock.components/editUtilityModal/editUtilityModal.component";
import {ClipboardModule} from "angular2-clipboard";
import {SelectLocaleForRuntimeModal} from "../theme/airlock.components/selectLocaleForRuntimeModal";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    DropdownMultiselectModule,
    MultiselectDropdownModule,
    DropdownModule.forRoot(),
    TooltipModule.forRoot(),
    SelectModule,
    AccordionModule.forRoot()
    ,SimpleNotificationsModule,Ng2Bs3ModalModule,PopoverModule.forRoot(),TreeModule,ClipboardModule
  ],
  declarations: [
    AceEditor, AceModal, ShowMessageModal,ShowConflictsModal,EditInputSchemaModal,DocumentlinksModal,SelectLocaleForRuntimeModal,CustomAirlockHeader
  ,VerifyActionModal,UiSwitchComponent,EditBranchModal,ImportStringsModal,EditUtilityModal

  ],
  exports:
  [
    AirlockTooltip, AceEditor,EditBranchModal,
    AceModal,ShowMessageModal,ShowConflictsModal,EditInputSchemaModal,DocumentlinksModal,SelectLocaleForRuntimeModal,CustomAirlockHeader,VerifyActionModal,UiSwitchComponent,ImportStringsModal,EditUtilityModal
  ]
    ,
    providers: [
  FeatureUtilsService,

]
})
export default class ALCommonsModule {
}
