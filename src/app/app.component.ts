import './app.loader.ts';
import {Component, ViewEncapsulation, ViewContainerRef, HostListener} from "@angular/core";
import {BaThemeConfigProvider, BaThemeConfig} from "./theme";
import {BaImageLoaderService, BaThemeSpinner} from "./theme/services";
import {layoutPaths} from "./theme/theme.constants";
import {AuthorizationService} from "./services/authorization.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {AirlockService} from "./services/airlock.service";
// import {Modal, BS_MODAL_PROVIDERS} from 'angular2-modal/plugins/bootstrap';
import {BaThemeRun} from "./theme/directives/baThemeRun/baThemeRun.directive";
import {BaThemePreloader} from "./theme/services/baThemePreloader/baThemePreloader.service";
import {Modal} from "angular2-modal/plugins/bootstrap";
import {GlobalState} from "./global.state";
import { MENU } from './app.menu';
import {BaMenuService} from "./theme/services/baMenu/baMenu.service";
import {Router, Routes} from '@angular/router';
import {TransparentSpinner} from "./theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {Overlay} from "angular2-modal";
import {ToastrConfig, ToastrService} from "ngx-toastr";
/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app',
    // directives: [BaThemeRun, SimpleNotificationsComponent],
    providers: [BaThemeConfigProvider, BaThemeConfig, BaImageLoaderService, BaThemeSpinner, TransparentSpinner, NotificationsService, AuthorizationService, Modal],
    encapsulation: ViewEncapsulation.None,
    styles: [require('normalize.css'), require('./app.scss')],
    template: `
    <span defaultOverlayTarget></span>
    <simple-notifications [options]="options" (onCreate)="onCreate($event)" (onDestroy)="onDestroy($event)"></simple-notifications>
    <main [ngClass]="{'menu-collapsed': isMenuCollapsed}" baThemeRun>
    
      <div class="additional-bg"></div>
      
      <router-outlet></router-outlet>
    </main>
  `
})
export class App {
    isGodModeUnlocked = false;
    isIdModeUnlocked = false;
    lastChar = null;
    konamiCount = 0;
    idsCount = 0;
    isMenuCollapsed:boolean = false;
    constructor(private _state:GlobalState, private _imageLoader:BaImageLoaderService, private _spinner:BaThemeSpinner,
                private _config:BaThemeConfig,private authorizationService:AuthorizationService, private _notificationService: NotificationsService,
                private _airlockService:AirlockService, public modal: Modal, private viewContainer: ViewContainerRef, private overlay: Overlay,private _menuService: BaMenuService,
                private toastrService: ToastrService, toastrConfig: ToastrConfig, private router:Router) {
        console.log(MENU);
        //config toasts
        toastrConfig.timeOut = 0;
        toastrConfig.closeButton = true;
        toastrConfig.positionClass = 'toast-bottom-right';
        toastrConfig.preventDuplicates = true;
        toastrConfig.autoDismiss = true;

        this._airlockService._menu=MENU;
        this._menuService.updateMenuByRoutes(<Routes>MENU);
        this._loadImages();
        authorizationService.init(_airlockService.getUserRole());
        this._state.subscribe('menu.isCollapsed','app', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });
        this._airlockService.subscribe('error-notification',(message) => {
            this.create(message);
        });
        this._airlockService.subscribe('success-notification',(messageObj) => {
            if (messageObj) {
                this.toastrService.success(messageObj.message, messageObj.title, {
                    timeOut: 2500,
                    closeButton: true,
                    positionClass: 'toast-bottom-right'
                });
            }
        });
        this._airlockService.subscribe('info-notification',(messageObj) => {
            if (messageObj) {
                this.toastrService.info(messageObj.message, messageObj.title, {
                    timeOut: 4000,
                    closeButton: true,
                    positionClass: 'toast-bottom-right'
                });
            }
        });
        overlay.defaultViewContainer =  viewContainer;
        // modal.overlay.defaultViewContainer = viewContainer;
        console.log("Application initialized - these are the EVN variables:");
        // console.log(JSON.stringify(process.env));
    }

    showSuccess() {
        this.toastrService.success('Hello world!', 'Toastr fun!');
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.handleKeyPress(event.key);
    }

    private handleKeyPress(key:string) {
        if (!this.isGodModeUnlocked) {
            if (this.lastChar==null && key=="i") {
                this.lastChar = key;
                this.konamiCount = 0;
            } else if (this.lastChar=="i" && key =="d") {
                this.lastChar = key;
                this.konamiCount = 0;
            } else if (this.lastChar=="d" && key =="k") {
                this.lastChar = key;
                this.konamiCount = 0;
            } else if (this.lastChar=="k" && key =="f") {
                this.lastChar = key;
                this.konamiCount = 0;
            } else if (this.lastChar=="f" && key =="a") {
                this.lastChar = key;
                this.konamiCount = 0;
                this.isGodModeUnlocked = true;
                let message = "<div style='display: -webkit-flex;\n" +
                    "  display: flex;\n" +
                    "  -webkit-flex-direction: row; -webkit-justify-content: flex-start; justify-content: flex-start\n" +
                    "  flex-direction: row;'><img src='assets/img/app/profile/idkfa.png' width='62' height='62' style='padding-right: 8px;'> <span style='vertical-align: middle'><div style='padding-bottom: 14px;'>Congratulations</div>You have unlocked all products and all administrator permissions!</span></div>";
                let title = "Congratulations";
                this.toastrService.info(message, null, {
                    timeOut: 500000,
                    closeButton: true,
                    positionClass: 'toast-bottom-full-width',
                    enableHtml: true
                });
                var audio = new Audio();
                audio.src = "assets/img/app/profile/theme.mp3";
                audio.load();
                audio.play();
            } else {
                this.lastChar = null;
            }
        }
        //check for konami
        if (this.konamiCount==0 && key=="ArrowUp") {
            this.konamiCount = 1;
        } else if (this.konamiCount==1 && key =="ArrowUp") {
            this.konamiCount = 2;
        } else if (this.konamiCount==2 && key =="ArrowDown") {
            this.konamiCount = 3;
        } else if (this.konamiCount==3 && key =="ArrowDown") {
            this.konamiCount = 4;
        } else if (this.konamiCount==4 && key =="ArrowLeft") {
            this.konamiCount = 5;
        } else if (this.konamiCount==5 && key =="ArrowRight") {
            this.konamiCount = 6;
        } else if (this.konamiCount==6 && key =="ArrowLeft") {
            this.konamiCount = 7;
        } else if (this.konamiCount==7 && key =="ArrowRight") {
            this.konamiCount = 8;
        } else if (this.konamiCount==8 && key =="a") {
            this.konamiCount = 9;
        } else if (this.konamiCount==9 && key =="b") {
            this.showKonami();
            this.konamiCount = 0;
        } else {
            this.konamiCount = 0
        }
    }

    showKonami() {
        window.open('konami.html');
    }
    public ngAfterViewInit():void {
        // hide spinner once all loaders are completed
        BaThemePreloader.load().then((values) => {
            this._spinner.hide();
            var activeLink = this._state.getStringFromLocalStorage('menu.activeLink');
            console.log("activeLink:"+activeLink);
            if (activeLink && activeLink.length > 0) {
                if (activeLink.toLowerCase() == "user groups") {
                    activeLink = "groups";
                }
                if(!this.canViewSelectedLink(activeLink)){
                    this.router.navigate(['/pages/features']);
                }
                else{
                    this.router.navigate(['/pages/'+activeLink.toLowerCase()]);
                }
            }

        });
    }

    private canViewSelectedLink(link:string):boolean{
        if(link == "features" || link == "products" || link == "groups" || link == "Authorization"){
            return true;
        }
        if (link == "Webhooks") {
            return this._airlockService.isAdministrator();
        }
        let currentProduct = this._state.getData("features.currentProduct");
        if(currentProduct == null){
            return true;
        }
        let currentCapabilities = currentProduct.capabilities;
        this._airlockService.setCapabilities(currentProduct);
        return currentCapabilities.includes(link.toUpperCase());

    }

    private _loadImages():void {
        // register some loaders
        BaThemePreloader.registerLoader(this._imageLoader.load(layoutPaths.images.root + 'sky-bg.jpg'));
    }

    //notifications stuff
    public options = {
        timeOut: 0,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: "visible",
        rtl: false,
        animate: "scale",
        position: ["right", "bottom"]
    };

    create(message:string) {
        // this._notificationService.bare("Error", message);
        this.toastrService.error(message,"Error", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-notification bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        })
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }
}
