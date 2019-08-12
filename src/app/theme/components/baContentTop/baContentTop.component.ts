import {Component} from '@angular/core';


import {StringsService} from "../../../services/strings.service";

import {GlobalState} from "../../../global.state";

@Component({
  selector: 'ba-content-top',
  styles: [require('./baContentTop.scss')],
  template: require('./baContentTop.html'),
})
export class BaContentTop {

  public activePageTitle:string = '';
  public activePageSubTitle:string = '';

  constructor(private _state:GlobalState, private _stringsSrevice: StringsService) {
    console.log("BaContentTop cstr");
    var activeLink = this._state.getStringFromLocalStorage('menu.activeLink');
    console.log("activeLink");
    console.log(activeLink);
    if(activeLink){
      let activeTitle = this.getString(activeLink+"_title");
      if (activeTitle=="") {
        activeTitle = activeLink;
      }
      console.log("activeLink setvalue");
      this.activePageTitle = activeTitle;
      this.activePageSubTitle = this.getString(activeLink);
      console.log(this.activePageTitle);
      console.log(this.activePageSubTitle);
    }
    this._state.subscribe('menu.activeLink','batop', (activeLink) => {
      console.log("BaContentTop in subscribe");
      if (activeLink) {
        console.log("activeLink!");
        console.log(activeLink);
        let activeTitle = this.getString(activeLink.title+"_title");
        if (activeTitle=="") {
          activeTitle = activeLink.title;
        }
        this.activePageTitle = activeTitle;
        this.activePageSubTitle = this.getString(activeLink.title);
      }
    });
  }

  getString(name: string) {
    console.log("getString:"+name)
    return this._stringsSrevice.getString(name);
  }
}
