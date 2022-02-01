import {Component, ViewChild} from '@angular/core';

//to use theme eclipse
//with angular-cli add "../node_modules/ace-builds/src-min/ace.js"
//and "../node_modules/ace-builds/src-min/theme-eclipse.js" to "scripts" var into the file angular-cli.json
/*
@Component({
    selector: 'airlock-search',
    templateUrl: 'airlockSearch.html',
    styleUrls: ['airlockSearch.scss']
})
 */
@Component({
    selector: 'ace-editor-2',
    template: `
  <ace-editor
       [(text)]="text"
        #editor style="height:150px;">
      
  </ace-editor>
  `
})
export class AceCmp {
    @ViewChild('editor') editor;
    text: string = "";

    ngAfterViewInit() {
        this.editor.setTheme("eclipse");

        this.editor.getEditor().setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
        });

        let ed = this.editor;
        this.editor.getEditor().commands.on("afterExec", function (e) {
            if (e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) {
                ed.getEditor().execCommand("startAutocomplete");
            }
        });

    }
}
