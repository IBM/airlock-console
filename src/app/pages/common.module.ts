import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PendingIcon} from "../@theme/airlock.components/pendingIcon";
import {LoadingIcon} from "../@theme/airlock.components/loadingIcon";
import {AirlockTooltip} from "../@theme/airlock.components/airlockTooltip/airlockTooltip.component";
import {NgaModule} from "../@theme/nga.module";
import {AceEditor} from "../@theme/airlock.components/aceEditor/aceEditor";
import {CustomAirlockHeader} from "../@theme/airlock.components/customAirlockHeader/customAirlockHeader.component";
import {EditBranchModal} from "../@theme/modals/editBranchModal";
import {AceModal} from "../@theme/modals/aceModal/aceModal.component";
import {EditUtilityModal} from "../@theme/modals/editUtilityModal";
import {VerifyActionModal} from "../@theme/modals/verifyActionModal";
import { AceEditorModule } from 'ngx-ace-editor-wrapper';
import {
    NbAutocompleteModule, NbButtonModule,
    NbCardModule,
    NbContextMenuModule, NbIconModule,
    NbPopoverModule,
    NbSelectModule,
    NbTabsetModule,
    NbToggleModule
} from "@nebular/theme";
import {EditInputSchemaModal} from "../@theme/modals/editInputSchemaModal/editInputSchemaModal.component";
import {ShowErrorModal} from "../@theme/modals/showErrorModal";
import {DocumentlinksModal} from "../@theme/airlock.components/documentlinksModal";
import {ConfirmActionModal} from "../@theme/modals/confirmActionModal";
import {ImportStringsModal} from "../@theme/modals/importStringsModal";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ShowConflictsModal} from "../@theme/modals/showConflictsModal";
import {StickyViewDirective} from "../@theme/directives/stickyView/sticky-view.directive";
import {UserGroupsInput} from "../@theme/airlock.components/userGroupsInput";
import {TagInputModule} from "ngx-chips-angular";
import {AirlockSearch} from "../@theme/airlock.components/airlockSearch";
import {ToggleSettingsButtonComponent} from "../@theme/components";
import {AceCmp} from "../@theme/airlock.components/aceEditor/aceEditor2";
import { SaveActionModal } from 'app/@theme/modals/saveActionModal';


// @ts-ignore
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbTabsetModule,
        NbToggleModule,
        NbCardModule,
        AceEditorModule,
        NbSelectModule,
        NbContextMenuModule,
        AccordionModule,
        NbIconModule,
        NbPopoverModule,
        NbAutocompleteModule,
        TagInputModule,
        NbButtonModule,
    ],
    declarations: [
        AceEditor,
        AceCmp,
        AceModal,
        UserGroupsInput,
        AirlockSearch,
        CustomAirlockHeader,
        DocumentlinksModal,
        PendingIcon,
        LoadingIcon,
        VerifyActionModal,
        ConfirmActionModal,
        SaveActionModal,
        EditUtilityModal,
        EditInputSchemaModal,
        ToggleSettingsButtonComponent,
        EditBranchModal,
        ShowErrorModal,
        ImportStringsModal,
        ShowConflictsModal,
        StickyViewDirective,
    ],
    exports:
        [
            NbTabsetModule,
            NbToggleModule,
            NbCardModule,
            NbSelectModule,
            NbContextMenuModule,
            AirlockTooltip,
            AceEditor,
            AceModal,
            UserGroupsInput,
            CustomAirlockHeader,
            DocumentlinksModal,
            // UiSwitchComponent,
            PendingIcon,
            AirlockSearch,
            LoadingIcon,
            VerifyActionModal,
            ConfirmActionModal,
            SaveActionModal,
            ShowErrorModal,
            ImportStringsModal,
            ShowConflictsModal,
            StickyViewDirective,
            ToggleSettingsButtonComponent,
            AceCmp,
        ]
})
export default class ALCommonsModule {
}
