import {
    Directive,
    ElementRef,
    Renderer2,
    Inject,
    PLATFORM_ID,
    OnDestroy,
    HostBinding, HostListener
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {NbLayoutScrollService} from "@nebular/theme";

enum StickyState {
    fixed = "fixed",
    noFixed = "no-fixed"
}

@Directive({
    selector: '[sticky-view]'
})
export class StickyViewDirective implements OnDestroy{
    parent: any;
    public scrollSubscription:Subscription = null;
    private fixedState = StickyState.noFixed;
    private offsetFromTop = 100;
    destroy = new Subject();
    destroy$ = this.destroy.asObservable();
    @HostBinding('style.width') width: string;
    @HostBinding('style.top') top: string;
    containerElement: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private element: ElementRef,
        private renderer:Renderer2,
        private nbLayoutScrollService: NbLayoutScrollService
    ) {
    }

    ngOnInit(){
        this.initStickyElement();
        this.containerElement = document.getElementsByClassName('layout-container')[0];
    }

    private initStickyElement(){
        this.getFixedViewOffset();
        this.nbLayoutScrollService.onScroll().subscribe(r => this.nbLayoutScrollService.getPosition().subscribe(p => this.handleScroll(p)));
    }

    private getFixedViewOffset(){
        //set the fixed class
        this.renderer.addClass(this.element.nativeElement, 'fixed');
        //save the view offset in fixed position
        this.offsetFromTop = this.element.nativeElement.getBoundingClientRect().bottom;
        //remove again the fixed class
        this.renderer.removeClass(this.element.nativeElement, 'fixed');
    }

    private handleScroll(currentScroll){
        if (this.element.nativeElement.previousSibling == null){
            return;
        }
        if(this.fixedState == StickyState.noFixed
            && currentScroll.y > this.offsetFromTop){
            this.fixedState = StickyState.fixed;
            this.renderer.addClass(this.element.nativeElement, 'fixed');
            this.width = this.element.nativeElement.previousSibling.offsetWidth + 'px';
            this.top = this.containerElement.offsetTop + (this.element.nativeElement.offsetHeight * 1.8) + 'px';
        }
        //if fixed
        else if(this.fixedState == StickyState.fixed){
            // let currentOffsetFromTop = currentScroll.y + this.element.nativeElement.getBoundingClientRect().top;
            //and the current offset from top is greater or equal than the original
            //unfix it
            if (currentScroll.y  <= this.offsetFromTop){
                this.fixedState = StickyState.noFixed;
                this.renderer.removeClass(this.element.nativeElement, 'fixed');
            }
        }
    }

    public handleWidthChanged(){
        console.log('handleWidthChanged')
    }

    ngOnDestroy(): void {
    }
}
