import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Groups} from "./groups.component";
import {GroupList} from "./components/groupList/groupList.component";
import {GroupDetail} from "./components/groupDetail/groupDetail.component";
import {GroupsNode} from "../../@theme/airlock.components/groupsTree/groupsNode.component";
import {NgaModule} from "../../@theme/nga.module";
import {routing} from "./groups.routing";
import {UsageDetail} from "./components/usageDetail";
import {ModalModule} from "ngx-bootstrap/modal";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {NbCardModule} from "@nebular/theme";
import {BaThemeConfigProvider} from "../../@theme/theme.configProvider";
import {BaThemeConfig} from "../../@theme/theme.config";
import {AddGroupModal} from "../../@theme/modals/addGroupModal";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        ModalModule.forRoot(),
        AccordionModule.forRoot(),
        routing
    ],
    declarations: [
        Groups,
        GroupList,
        GroupDetail,
        GroupsNode,
        UsageDetail,
        AddGroupModal
    ],
    providers: [
        BaThemeConfigProvider,
        BaThemeConfig,
    ]
})
export class GroupsModule {
}
