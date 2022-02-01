// import {ElementRef} from 'angular2/core';
// import {Directive, EventEmitter} from 'angular2/angular2';
//declare the ace library as Magic;
import {Directive, ElementRef, EventEmitter, Input} from "@angular/core";

// import * as ace from 'ace-builds';
var ace = require('brace');
require('brace/mode/javascript');
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

// ace:any;
// Note the aceEditor doesn't have a template so is a Directive
@Directive({
    selector: '[ace-editor]',
    inputs: [
        'markdown',
        'readonly',
        'sample',
        'sql',
        'utilitiesinfo',
        'senddiff',
        'heightSize'
    ],
    outputs: ['contentChange: onTextChanged']
})
export class AceEditor {
    // http://ace.c9.io/#nav=api&api=editor
    editor;
    sampleSchema;
    utilitiesInfo;
    height;
    el;
    sendDiff;
    isSQL = false;
    /** When the markdown content changes we broadcast the entire document. */
    contentChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() name: string;
    filterFunc: any;
    didChanged: boolean;

    constructor(elementRef: ElementRef) {
        // Note the constructor doesn't have access to any data from properties
        // We can instead use a setter
        // This is the <div ace-editor> root element
        // Ideally this wouldn't be required
        this.didChanged = false;
        this.el = elementRef.nativeElement;
        ace.config.set('basePath', '/ace-builds/src-noconflict');
        // ace.config.set('modePath', '/ace-builds/src-noconflict');
        ace.config.set('themePath', '/ace-builds/src-noconflict');
        this.el.classList.add("editor");
        this.editor = ace.edit(this.el);
        this.editor.getSession().setMode("ace/mode/javascript");
        if (this.editor.getReadOnly()) {
            this.editor.setTheme("ace/theme/monokai");
        } else {
            this.editor.setTheme('ace/theme/textmate');
        }
        this.editor.on("focus", (e) => {
            // Discard the delta (e), and provide whole document
            console.log(this.sampleSchema);
            var langTools = ace.acequire("ace/ext/language_tools");
            if (langTools != undefined) {
                langTools.setCompleters([]);
                langTools.addCompleter(this.filterFunc);
            } else {
                console.warn("langTools is empty - should not be!!!!")
            }
        });


        this.editor.on("blur", (e) => {
            // Discard the delta (e), and provide whole document
            if (!this.sendDiff) {
                this.contentChange.emit(this.editor.getValue());
            } else {
                this.contentChange.emit({"value": this.editor.getValue(), "diff": this.didChanged});

            }
        });
        this.editor.$blockScrolling = Infinity;

    }

    ngAfterViewInit() {
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
        });

        let ed = this.editor;
        this.editor.commands.on("afterExec", function (e) {
            if (e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) {
                ed.execCommand("startAutocomplete");
            }
        });
        if (this.editor.getReadOnly()) {
            this.editor.setTheme("ace/theme/monokai");
        } else {
            this.editor.setTheme('ace/theme/textmate');
        }

    }
    ngOnInit() {
        //set up by aceEditorRuleHeight = 250px from editInputSchemaModal.html
        this.el.style.height = this.height;

        var contextSchema = this.sampleSchema;
        var self = this;

        this.editor.commands.on("afterExec", function (e) {
            if (e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) {
                e.editor.execCommand("startAutocomplete");

            }
        });

        var langTools = ace.acequire("ace/ext/language_tools");
        if (langTools === undefined) {
            console.warn("langTools is undefined")
        } else {
            langTools.setCompleters([]);
        }

        this.editor.setOptions({
            enableBasicAutoCompletion: true,
            enableSnippets: true,
            enableLiveAutoCompletion: false
        });
        this.editor.setShowPrintMargin(false);
        
        var customCompleter = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                var basePrefix = '';
                //basePrefix = findBasePrefix(editor.session.doc.getLine(pos.row), pos.column);
                //basePrefix = cutUptoRightDot(trimFromTheLeft(editor.session.doc.getLine(pos.row), pos.column), pos);
                basePrefix = trimFromTheLeft(editor.session.doc.getLine(pos.row), pos.column);
                // console.log('base Prefix:' + basePrefix);

                var contextResArr = [];
                var fullPathSchemaObject = 'contextSchema' + '.' + basePrefix;
                var sampleMeta = "Airlock";
                if (self.isSQL) {
                    sampleMeta = "Column Names"
                }
                var obj: string;
                try {
                    //context
                    for (obj in eval(fullPathSchemaObject)) {
                        /*
                         if( Object.prototype.toString.call( eval(str) ) === '[object String]' ) {
                         break;
                         }
                         if( Object.prototype.toString.call( eval(str) ) === '[object Array]' ) {
                            console.log( 'this object is array' );
                        }
                        */
                        if (Object.prototype.toString.call(eval(fullPathSchemaObject)) === '[object Object]') {
                            //contextResArr.push({name: obj,  value: obj,  score: 1, meta: "Airlock"});
                            //check if the next element is an array. add [] if it's an array
                            if (Object.prototype.toString.call(eval(fullPathSchemaObject + '["' + obj + '"]')) === '[object Array]') {
                                contextResArr.push({name: obj + '[]', value: obj + '[]', score: 1, meta: sampleMeta});
                            } else {
                                contextResArr.push({name: obj, value: obj, score: 1, meta: sampleMeta});
                            }
                        }
                    }
                    // no prefix found get the first element of contextSchema
                    //if (contextResArr.length === 0 && basePrefix.indexOf('.') === -1 && prefix.length !== 0){

                    if (contextResArr.length === 0) {
                        //get the base object in Sample Schema (ususally context)
                        for (obj in self.sampleSchema) {
                            // add context as a completer only if it does not exist in a base prefix  (to deal with the last element)
                            if (basePrefix.indexOf(obj) == -1) {
                                if (self.isSQL) {
                                    contextResArr.push({name: obj, value: obj, score: 1, meta: self.sampleSchema[obj]});
                                } else {
                                    contextResArr.push({name: obj, value: obj, score: 1, meta: sampleMeta});
                                }

                            }
                        }
                        //UtilitiesInfo
                        for (obj in self.utilitiesInfo) {
                            if (self.utilitiesInfo.hasOwnProperty(obj)) {
                                var params = self.utilitiesInfo[obj].toString();
                                contextResArr.push({
                                    name: obj + '(' + params + ')',
                                    value: obj + '(' + params + ')',
                                    score: 1,
                                    meta: "Airlock Utils"
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.log('failed to eval:' + err);
                }
                contextResArr = contextResArr.sort((n1, n2) => {
                    if (n1.name && n2.name) {
                        if (n1.name.toLowerCase() > n2.name.toLowerCase()) {
                            return 1;
                        }

                        if (n1.name.toLowerCase() < n2.name.toLowerCase()) {
                            return -1;
                        }
                    }
                    return 0;
                });
                callback(null, contextResArr);
            }
        }
        this.filterFunc = customCompleter;
        // console.log (customCompleter);
        if (langTools != undefined) {
            langTools.addCompleter(customCompleter);
        }

        //Prefix is not empty
        //Search for most closed symol . space ( or )
        // if it is not .  return prefix as is
        // if it's . find the previous prefix until . ( or space
        // clean from possible []
        // example context bla => return bla
        // context[23].bla => context
        // context.weather.stam => weather

        function trimFromTheLeft(strRow, pos) {
            // console.log('position:' + pos);
            // trim all from  the right
            strRow = strRow.substring(0, pos);
            // console.log('Trimmed string from the right:' + strRow);
            var contextPath = '';
            var separators = [' ', '(', ')', '>', '<', '&', '*'];
            //separatorLocations is array of closest separators location from position to the left. -> (lola.aa   (-1, 0, -1)   -1 not found
            var separatorLocations = separators.map(function (separatorSymbol) {
                return strRow.lastIndexOf(separatorSymbol, pos - 1);
            });

            separatorLocations.forEach(function (value) {/*console.log(value)*/
            });
            //remove location of the symbol that not found
            var filteredSeparatorLocations = separatorLocations.filter(function (location) {
                return location > -1;
            });
            //console.log('filteredSeparatorLocations');
            //filteredSeparatorLocations.forEach(function (value) {console.log(value)});
            //find the max (closest) location

            if (filteredSeparatorLocations.length > 0) {
                var max = Math.max.apply(null, filteredSeparatorLocations);
                var closestSeparator = strRow[max];
                //console.log('closest separator:' + closestSeparator);
                //console.log('debug1: ' + strRow.substring(max+1, pos));
                contextPath = strRow.substring(max + 1, pos);
            } else {
                // console.log('closest separator not found. Take all from the begining of the line:' + strRow);
                contextPath = strRow;
            }

            // Remove the last . if exist
            var lastDot = contextPath.lastIndexOf('.', pos);
            //console.log('last dot: ' + lastDot);
            if (lastDot > 0) {
                contextPath = contextPath.substring(0, lastDot);
            }
            //contextPath = contextPath.replace(/\[(.*?)\]/g, '');

            // console.log('Prefix form the left separator:' + contextPath);
            return contextPath;
        }
    }

    set markdown(text) {
        if ((text != this.editor.getValue()) && (text != null) && (Object.prototype.toString.call(text) === '[object String]')) {
            //console.log("in markdown", text);
            //console.log('text typeof1', Object.prototype.toString.call(text));
            //console.log('text typeof2', typeof text);
            this.editor.setValue(text);
            this.editor.clearSelection();
            this.editor.focus();
            this.didChanged = false;
        }
    }

    set readonly(text) {
        if (text === "true" || text === true) {
            this.editor.setReadOnly(true);
            this.editor.setTheme("ace/theme/monokai");
        } else {
            this.editor.setReadOnly(false);
            this.editor.setTheme('ace/theme/textmate');
        }
    }

    set sample(text) {
        //get sample schema from feature cell
        // console.log(text);
        this.sampleSchema = text;
    }

    set sql(text) {
        if (text && (text === "true" || text === true)) {
            this.editor.getSession().setMode("ace/mode/sql");
            this.isSQL = true;
        } else {
            this.editor.getSession().setMode("ace/mode/javascript");
            this.isSQL = false;
        }
    }

    set utilitiesinfo(text) {
        // console.log('DEBUG60:');
        // console.log(text);
        this.utilitiesInfo = text;
    }

    set senddiff(val) {
        this.sendDiff = val;
        if (this.sendDiff) {
            this.editor.on("change", (e) => {
                this.didChanged = true;
            });
        }
    }

    set heightSize(text) {
        //get sample schema from feature cell
        this.height = text;
        // console.log("HEIGHT SIZE: " + this.height );
    }

    getTextContent() {
        return this.editor.getValue();
    }
}
