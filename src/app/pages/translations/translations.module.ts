/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './translations.routing';
import {TranslationsPage} from "./translations.component";
import ALCommonsModule from "../common.module";
import {StringsMasterDetail} from "./components/stringsMasterDetailView/strings.master.detail.component";
import {StringList} from "./components/stringsMasterDetailView/stringsList/strings.list.component";
import {StringsTableView} from "./components/stringsTableView/strings.table.component";
import {StringDetail} from "./components/stringsMasterDetailView/stringsDetail/strings.detail.component";
import {StringStatus} from "../../@theme/airlock.components/stringStatus/stringStatus.component";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {AddStringModal} from "../../@theme/modals/addStringModal";
import {NbCardModule, NbPopoverModule, NbTabsetModule, NbTooltipModule, NbTreeGridModule} from "@nebular/theme";
import {EditStringModal} from "../../@theme/modals/editStringModal";
import {MarkForTranslationModal} from "../../@theme/modals/markForTranslationModal/markForTranslationModal.component";
import {BaThemeConfigProvider} from "../../@theme/theme.configProvider";
import {BaThemeConfig} from "../../@theme/theme.config";
import {StringUsageModal} from "../../@theme/modals/stringUsageModal";
import {OverrideStringModal} from "../../@theme/modals/overrideStringModal";
import {Ng2SmartTableModule} from "ng2-smart-table";
import {CustomActionComponent} from "./components/stringsTableView/smartTableCustom/custom.action.component";
import {CustomTranslationComponent} from "./components/stringsTableView/smartTableCustom/custom.translation.component";
import {CustomStatusComponent} from "./components/stringsTableView/smartTableCustom/custom.status.compunent";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        TooltipModule.forRoot(),
        NbTooltipModule,
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        ALCommonsModule,
        NbTreeGridModule,
        Ng2SmartTableModule,
        NbPopoverModule,
        routing,
    ],
    declarations: [
        TranslationsPage,
        AddStringModal,
        StringsMasterDetail,
        StringList,
        StringDetail,
        StringsTableView,
        MarkForTranslationModal,
        EditStringModal,
        StringStatus,
        OverrideStringModal,
        // StringIssueModal,
        // CreateIssueModal,
        StringUsageModal,
        CustomActionComponent,
        CustomStatusComponent,
        CustomTranslationComponent,
    ],
    providers: [
        BaThemeConfigProvider,
        BaThemeConfig,
    ]
})
export class TranslationsModule {}
