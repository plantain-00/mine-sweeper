// @ts-nocheck
/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
import { createBlock as _createBlock, createCommentVNode as _createCommentVNode, createVNode as _createVNode, Fragment as _Fragment, openBlock as _openBlock, renderList as _renderList, toDisplayString as _toDisplayString, vModelSelect as _vModelSelect, vModelText as _vModelText, withDirectives as _withDirectives } from 'vue'
// tslint:disable
/* eslint-disable */

export function indexTemplateHtml(_ctx, _cache) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("div", { class: "control" }, [
      _createVNode("span", { title: "mines" }, _toDisplayString(_ctx.remainMineCount), 1 /* TEXT */),
      _createVNode("span", { title: "unknown" }, _toDisplayString(_ctx.remainUnknownCount), 1 /* TEXT */),
      _createVNode("span", { title: "average possibility" }, _toDisplayString(_ctx.averagePossibility), 1 /* TEXT */),
      _withDirectives(_createVNode("input", {
        type: "number",
        "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (_ctx.rowCount = $event)),
        title: "row count"
      }, null, 512 /* NEED_PATCH */), [
        [_vModelText, _ctx.rowCount]
      ]),
      _withDirectives(_createVNode("input", {
        type: "number",
        "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => (_ctx.columnCount = $event)),
        title: "column count"
      }, null, 512 /* NEED_PATCH */), [
        [_vModelText, _ctx.columnCount]
      ]),
      _withDirectives(_createVNode("input", {
        type: "number",
        "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => (_ctx.mineCount = $event)),
        title: "mine count"
      }, null, 512 /* NEED_PATCH */), [
        [_vModelText, _ctx.mineCount]
      ]),
      _withDirectives(_createVNode("select", {
        "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => (_ctx.difficulty = $event)),
        title: "difficulty"
      }, [
        _createVNode("option", { value: "0" }, "normal"),
        _createVNode("option", { value: "1" }, "easy"),
        _createVNode("option", { value: "2" }, "easier"),
        _createVNode("option", { value: "3" }, "no brain")
      ], 512 /* NEED_PATCH */), [
        [_vModelSelect, _ctx.difficulty]
      ]),
      _createVNode("button", {
        onClick: _cache[5] || (_cache[5] = $event => (_ctx.start()))
      }, "restart")
    ]),
    _createVNode("div", {
      class: "main",
      style: _ctx.mainStyle
    }, [
      (_openBlock(true), _createBlock(_Fragment, null, _renderList(_ctx.cells, (row, rowIndex) => {
        return (_openBlock(), _createBlock(_Fragment, null, [
          (_openBlock(true), _createBlock(_Fragment, null, _renderList(row, (cell, columnIndex) => {
            return (_openBlock(), _createBlock(_Fragment, null, [
              (cell.visible)
                ? (_openBlock(), _createBlock(_Fragment, { key: 0 }, [
                    (cell.value === null)
                      ? (_openBlock(), _createBlock("div", {
                          key: 0,
                          class: "item mine"
                        }))
                      : (cell.value === 0)
                        ? (_openBlock(), _createBlock("div", {
                            key: 1,
                            class: "item"
                          }))
                        : (_openBlock(), _createBlock("div", {
                            key: 2,
                            class: "item"
                          }, _toDisplayString(cell.value), 1 /* TEXT */))
                  ], 64 /* STABLE_FRAGMENT */))
                : (_openBlock(), _createBlock(_Fragment, { key: 1 }, [
                    (cell.flagged)
                      ? (_openBlock(), _createBlock("div", {
                          key: 0,
                          class: "item unknown",
                          onContextmenu: $event => (_ctx.contextmenu($event, rowIndex, columnIndex, false))
                        }, "¶", 40 /* PROPS, HYDRATE_EVENTS */, ["onContextmenu"]))
                      : (_openBlock(), _createBlock("div", {
                          key: 1,
                          class: "item unknown",
                          onClick: $event => (_ctx.click(rowIndex, columnIndex)),
                          onContextmenu: $event => (_ctx.contextmenu($event, rowIndex, columnIndex, true))
                        }, _toDisplayString((_ctx.difficulty >= 3 && cell.possibility >= 0) ? cell.possibility : ""), 41 /* TEXT, PROPS, HYDRATE_EVENTS */, ["onClick", "onContextmenu"]))
                  ], 64 /* STABLE_FRAGMENT */))
            ], 64 /* STABLE_FRAGMENT */))
          }), 256 /* UNKEYED_FRAGMENT */))
        ], 64 /* STABLE_FRAGMENT */))
      }), 256 /* UNKEYED_FRAGMENT */))
    ], 4 /* STYLE */)
  ]))
}
/* eslint-enable */
// tslint:enable
