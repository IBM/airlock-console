import {Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer} from '@angular/core';

@Component({
  selector: 'ba-picture-uploader',
  styles: [require('./baPictureUploader.scss')],
  template: require('./baPictureUploader.html'),
})
export class BaPictureUploader {

  @Input() defaultPicture:string = '';
  @Input() picture:string = '';

  @Input() uploaderOptions:any = {};
  @Input() canDelete:boolean = true;

  onUpload:EventEmitter<any> = new EventEmitter();
  onUploadCompleted:EventEmitter<any> = new EventEmitter();

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;

  public uploadInProgress:boolean = false;

  constructor(private renderer:Renderer) {
  }

  public ngOnInit():void {
  }

  public onFiles():void {
  }

  public bringFileSelector():boolean {
    return false;
  }

  public removePicture():boolean {
    return false;
  }

  protected _changePicture(file:File):void {
  }

  protected _onUpload(data):void {
  }

  protected _onUploadCompleted(data):void {
  }

  protected _canUploadOnServer():boolean {
    return false;
  }
}
