/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
// tslint:disable
import { App } from "./index";

// @ts-ignore
export function indexTemplateHtml(this: App) {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{staticClass:"control"},[_c('span',{attrs:{"title":"mines"}},[_vm._v(_vm._s(_vm.remainMineCount))]),_vm._v(" "),_c('span',{attrs:{"title":"unknown"}},[_vm._v(_vm._s(_vm.remainUnknownCount))]),_vm._v(" "),_c('span',{attrs:{"title":"average possibility"}},[_vm._v(_vm._s(_vm.averagePossibility))]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.rowCount),expression:"rowCount"}],attrs:{"type":"number","title":"row count"},domProps:{"value":(_vm.rowCount)},on:{"input":function($event){if($event.target.composing){ return; }_vm.rowCount=$event.target.value}}}),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.columnCount),expression:"columnCount"}],attrs:{"type":"number","title":"column count"},domProps:{"value":(_vm.columnCount)},on:{"input":function($event){if($event.target.composing){ return; }_vm.columnCount=$event.target.value}}}),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.mineCount),expression:"mineCount"}],attrs:{"type":"number","title":"mine count"},domProps:{"value":(_vm.mineCount)},on:{"input":function($event){if($event.target.composing){ return; }_vm.mineCount=$event.target.value}}}),_vm._v(" "),_c('select',{directives:[{name:"model",rawName:"v-model",value:(_vm.difficulty),expression:"difficulty"}],attrs:{"title":"difficulty"},on:{"change":function($event){var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return val}); _vm.difficulty=$event.target.multiple ? $$selectedVal : $$selectedVal[0]}}},[_c('option',{attrs:{"value":"0"}},[_vm._v("normal")]),_vm._v(" "),_c('option',{attrs:{"value":"1"}},[_vm._v("easy")]),_vm._v(" "),_c('option',{attrs:{"value":"2"}},[_vm._v("easier")]),_vm._v(" "),_c('option',{attrs:{"value":"3"}},[_vm._v("no brain")])]),_vm._v(" "),_c('button',{on:{"click":function($event){_vm.start()}}},[_vm._v("restart")])]),_vm._v(" "),_c('div',{staticClass:"main",style:(_vm.mainStyle)},[_vm._l((_vm.cells),function(row,rowIndex){return [_vm._l((row),function(cell,columnIndex){return [(cell.visible)?[(cell.value === null)?_c('div',{staticClass:"item mine"}):(cell.value === 0)?_c('div',{staticClass:"item"}):_c('div',{staticClass:"item"},[_vm._v(_vm._s(cell.value))])]:[(cell.flagged)?_c('div',{staticClass:"item unknown",on:{"contextmenu":function($event){_vm.contextmenu($event, rowIndex, columnIndex, false)}}},[_vm._v("¶")]):_c('div',{staticClass:"item unknown",on:{"click":function($event){_vm.click(rowIndex, columnIndex)},"contextmenu":function($event){_vm.contextmenu($event, rowIndex, columnIndex, true)}}},[_vm._v(_vm._s((_vm.difficulty >= 3 && cell.possibility >= 0) ? cell.possibility : ""))])]]})]})],2)])}
// @ts-ignore
export var indexTemplateHtmlStatic = [  ]
// tslint:enable
