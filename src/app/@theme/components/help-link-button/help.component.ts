import {Component, HostListener} from '@angular/core';
import {LayoutService} from "../../../@core/utils";
import {GlobalState} from "../../../global.state";

@Component({
    selector: 'help-link-button',
    styleUrls: ['./help.component.scss'],
    templateUrl: './help.component.html',})
export class HelpComponent  {
    set visible(value: boolean) {
        if (this._visible !== value){
            this.changeMenuVisibility(this._visible)
        }
        this._visible = value;
    }

    private changeMenuVisibility(_visible: boolean) {
        this._state.notifyDataChanged('app.height', _visible);
    }

    _visible: boolean = false;
    titleVisible: boolean = true;
    minHeight = 685;
    constructor(
                private layoutService: LayoutService,
                private _state: GlobalState,
    ) {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.titleVisible = document.getElementById('menu-sidebar').clientWidth > 100;
        this.visible = (document.getElementById('menu-sidebar').firstChild as HTMLElement).clientHeight > this.minHeight;
    }

    ngOnInit(){
        this.titleVisible = document.getElementById('menu-sidebar').clientWidth > 100;
        this.visible = (document.getElementById('menu-sidebar').firstChild as HTMLElement).clientHeight > this.minHeight;
        this.layoutService.onChangeLayoutSize().subscribe((event) =>{
            this.titleVisible = document.getElementById('menu-sidebar').clientWidth > 100;
            this.visible = (document.getElementById('menu-sidebar').firstChild as HTMLElement).clientHeight > this.minHeight;
        });
    }
}
