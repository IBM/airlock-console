import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Groups} from "./groups.component";
import {GroupList} from "./components/groupList/groupList.component";
import {GroupDetail} from "./components/groupDetail/groupDetail.component";
import {GroupsNode} from "../../theme/airlock.components/groupsTree/groupsNode.component";
import { DropdownModule, ModalModule } from 'ng2-bootstrap';
import { AccordionModule } from 'ng2-bootstrap';
import {NgaModule} from "../../theme/nga.module";
import {routing} from "./groups.routing";
import {UsageDetail} from "./components/usageDetail";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    DropdownModule.forRoot(),
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    routing
  ],
  declarations: [
    Groups,
    GroupList,
    GroupDetail,
    GroupsNode,
    UsageDetail

  ]
})
export default class GroupsModule {
}
