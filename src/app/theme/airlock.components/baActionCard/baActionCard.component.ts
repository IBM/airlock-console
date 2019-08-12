import {Component, ViewEncapsulation, ViewChild, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'ba-action-card',
  styles: [require('./baActionCard.scss')],
  template: require('./baActionCard.html'),
  encapsulation: ViewEncapsulation.None
})
export class BaActionCard {
  @Input() title:String;
  @Input() baCardClass:String;
  @Input() showAction:boolean = false;
  @Output() onActionClicked:EventEmitter<any> = new EventEmitter();

  actionClicked() {
    this.onActionClicked.emit(null);
  }
}


