import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import {User} from "../../model/user";
import {Role} from "../../model/role";
import {VerifyActionModal} from "../../@theme/modals/verifyActionModal";
import {AuthorizationPage} from "./authorization.component";

@Component({
    template: `
    <input 
      type="checkbox" [disabled]="!canUncheckRole(rowData.user,role)"
      (click)="setRole(rowData.user, role, $event)"
      [checked]="checked">`
})
export class CustomCheckboxComponent implements ViewCell, OnInit {

    @Input() value: string;
    @Input() rowData: any;

    role: string;
    checked: boolean;
    authPage: AuthorizationPage;

    constructor() { }

    ngOnInit() {
        let splitValue = this.value.split(":");
        this.role = splitValue[0];
        this.checked = splitValue[1] === 'true';
        this.authPage = this.rowData.authPage;
    }

    canUncheckRole(user: User, role: string): boolean {
        return this.authPage.canUncheckRole(user, role);
    }

    setRole(user: User, role: string, event) {
        this.authPage.setRole(user, role, event);
        this.checked = event.target.checked;
    }
}
