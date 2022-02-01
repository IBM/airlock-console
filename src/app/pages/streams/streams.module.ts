/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './streams.routing';
import ALCommonsModule from "../common.module";
import {StreamsPage} from "./streams.component";
import {StreamCell} from "../../@theme/airlock.components/streamCell/streamCell.component";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {
    NbButtonModule,
    NbCardModule, NbDatepickerModule, NbDialogService, NbLayoutModule, NbPopoverModule, NbSelectModule, NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {AddStreamModal} from "../../@theme/modals/addStreamModal";
import {EditStreamModal} from "../../@theme/modals/editStreamModal";
import {EditStreamsDataModal} from "../../@theme/modals/editStreamsDataModal";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        NbDatepickerModule,
        TooltipModule.forRoot(),
        NbTabsetModule,
        NbButtonModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ALCommonsModule,
        routing,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
    ],
    declarations: [
        AddStreamModal,
        EditStreamModal,
        EditStreamsDataModal,
        StreamsPage,
        StreamCell,
    ],
    providers: [NbDialogService],
})
export class StreamsModule { }
