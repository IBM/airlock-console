import {Pipe, PipeTransform} from '@angular/core';
import {layoutPaths} from '../../../theme';

@Pipe({name: 'replaceLineBreak'})
export class ReplaceLineBreakPipe implements PipeTransform {

  transform(value: string): string {
    let newValue = value.replace(/\n/g, '<br/>');
    return `${newValue}`;
  }
}
