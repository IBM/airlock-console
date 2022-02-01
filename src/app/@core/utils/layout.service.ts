import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, shareReplay, debounceTime } from 'rxjs/operators';

@Injectable()
export class LayoutService {

  protected layoutSize$ = new Subject();
  protected layoutSizeChange$ = this.layoutSize$.pipe(
    shareReplay({ refCount: true }),
  );

  changeLayoutSize() {
    this.layoutSize$.next();
  }

  onChangeLayoutSize(): Observable<any> {
    return this.layoutSizeChange$.pipe(delay(1));
  }

  onSafeChangeLayoutSize(): Observable<any> {
    return this.layoutSizeChange$.pipe(
      debounceTime(350),
    );
  }

  static calculateModalWidth(): string {
    var marginW = 100;
    return (document.documentElement.clientWidth - marginW).toString() + 'px';
  };

  static calculateModalHeight(marginH = 100, divider = 1): string {
    return ((document.documentElement.clientHeight - marginH)/divider).toString() + 'px';
  };
}
