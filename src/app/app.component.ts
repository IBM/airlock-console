/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import './app.loader.ts';
import {Component, OnInit} from '@angular/core';
import {AnalyticsService} from './@core/utils';
import {SeoService} from './@core/utils';
import {NbIconLibraries, NbMenuService} from '@nebular/theme';
import {AirlockService} from './services/airlock.service';
import {AuthorizationService} from './services/authorization.service';
import {GlobalState} from "./global.state";


@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService,
              private seoService: SeoService,
              private iconLibraries: NbIconLibraries,
              private authorizationService: AuthorizationService,
              private _airlockService: AirlockService,
              private menuService: NbMenuService,
              private _state: GlobalState) {
    this.iconLibraries.registerFontPack('ionicons');
    this.iconLibraries.registerFontPack('fa', {packClass: 'fa', iconClassPrefix: 'fa'});
    this.iconLibraries.registerFontPack('brands', {packClass: 'fab', iconClassPrefix: 'fa'});
    authorizationService.init(_airlockService.getUserRole());
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }
}
