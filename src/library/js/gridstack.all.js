/*! For license information please see gridstack-all.js.LICENSE.txt */ ! function(t, e) { "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.GridStack = e() : t.GridStack = e() }(self, (function() {
    return function() {
        "use strict";
        var t = {
                74: function(t, e) {
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDBaseImplement = void 0;
                    var i = function() {
                        function t() { this._eventRegister = {} }
                        return Object.defineProperty(t.prototype, "disabled", { get: function() { return this._disabled }, enumerable: !1, configurable: !0 }), t.prototype.on = function(t, e) { this._eventRegister[t] = e }, t.prototype.off = function(t) { delete this._eventRegister[t] }, t.prototype.enable = function() { this._disabled = !1 }, t.prototype.disable = function() { this._disabled = !0 }, t.prototype.destroy = function() { delete this._eventRegister }, t.prototype.triggerEvent = function(t, e) { if (!this.disabled && this._eventRegister && this._eventRegister[t]) return this._eventRegister[t](e) }, t
                    }();
                    e.DDBaseImplement = i
                },
                366: function(t, e, i) {
                    var o, n = this && this.__extends || (o = function(t, e) {
                        return o = Object.setPrototypeOf || { __proto__: [] }
                        instanceof Array && function(t, e) { t.__proto__ = e } || function(t, e) { for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]) }, o(t, e)
                    }, function(t, e) {
                        if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");

                        function i() { this.constructor = t }
                        o(t, e), t.prototype = null === e ? Object.create(e) : (i.prototype = e.prototype, new i)
                    });
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDDraggable = void 0;
                    var r = i(839),
                        s = i(867),
                        a = i(74),
                        l = i(537);
                    e.DDDraggable = function(t) {
                        function e(e, i) {
                            void 0 === i && (i = {});
                            var o = t.call(this) || this;
                            o.el = e, o.option = i;
                            var n = i.handle.substring(1);
                            return o.dragEl = e.classList.contains(n) ? e : e.querySelector(i.handle) || e, o._mouseDown = o._mouseDown.bind(o), o._mouseMove = o._mouseMove.bind(o), o._mouseUp = o._mouseUp.bind(o), o.enable(), o
                        }
                        return n(e, t), e.prototype.on = function(e, i) { t.prototype.on.call(this, e, i) }, e.prototype.off = function(e) { t.prototype.off.call(this, e) }, e.prototype.enable = function() {!1 !== this.disabled && (t.prototype.enable.call(this), this.dragEl.addEventListener("mousedown", this._mouseDown), l.isTouch && (this.dragEl.addEventListener("touchstart", l.touchstart), this.dragEl.addEventListener("pointerdown", l.pointerdown)), this.el.classList.remove("ui-draggable-disabled")) }, e.prototype.disable = function(e) { void 0 === e && (e = !1), !0 !== this.disabled && (t.prototype.disable.call(this), this.dragEl.removeEventListener("mousedown", this._mouseDown), l.isTouch && (this.dragEl.removeEventListener("touchstart", l.touchstart), this.dragEl.removeEventListener("pointerdown", l.pointerdown)), e || this.el.classList.add("ui-draggable-disabled")) }, e.prototype.destroy = function() { this.dragTimeout && window.clearTimeout(this.dragTimeout), delete this.dragTimeout, this.dragging && this._mouseUp(this.mouseDownEvent), this.disable(!0), delete this.el, delete this.helper, delete this.option, t.prototype.destroy.call(this) }, e.prototype.updateOption = function(t) { var e = this; return Object.keys(t).forEach((function(i) { return e.option[i] = t[i] })), this }, e.prototype._mouseDown = function(t) { if (!r.DDManager.mouseHandled) return 0 !== t.button || t.target.closest('input,textarea,button,select,option,[contenteditable="true"],.ui-resizable-handle') || this.option.cancel && t.target.closest(this.option.cancel) || (this.mouseDownEvent = t, delete this.dragging, delete r.DDManager.dragElement, delete r.DDManager.dropElement, document.addEventListener("mousemove", this._mouseMove, !0), document.addEventListener("mouseup", this._mouseUp, !0), l.isTouch && (this.dragEl.addEventListener("touchmove", l.touchmove), this.dragEl.addEventListener("touchend", l.touchend)), t.preventDefault(), document.activeElement && document.activeElement.blur(), r.DDManager.mouseHandled = !0), !0 }, e.prototype._callDrag = function(t) {
                            if (this.dragging) {
                                var e = s.Utils.initEvent(t, { target: this.el, type: "drag" });
                                this.option.drag && this.option.drag(e, this.ui()), this.triggerEvent("drag", e)
                            }
                        }, e.prototype._mouseMove = function(t) {
                            var e, i = this,
                                o = this.mouseDownEvent;
                            if (this.dragging)
                                if (this._dragFollow(t), r.DDManager.pauseDrag) {
                                    var n = Number.isInteger(r.DDManager.pauseDrag) ? r.DDManager.pauseDrag : 100;
                                    this.dragTimeout && window.clearTimeout(this.dragTimeout), this.dragTimeout = window.setTimeout((function() { return i._callDrag(t) }), n)
                                } else this._callDrag(t);
                            else if (Math.abs(t.x - o.x) + Math.abs(t.y - o.y) > 3) {
                                this.dragging = !0, r.DDManager.dragElement = this;
                                var a = null === (e = this.el.gridstackNode) || void 0 === e ? void 0 : e.grid;
                                a ? r.DDManager.dropElement = a.el.ddElement.ddDroppable : delete r.DDManager.dropElement, this.helper = this._createHelper(t), this._setupHelperContainmentStyle(), this.dragOffset = this._getDragOffset(t, this.el, this.helperContainment);
                                var l = s.Utils.initEvent(t, { target: this.el, type: "dragstart" });
                                this._setupHelperStyle(t), this.option.start && this.option.start(l, this.ui()), this.triggerEvent("dragstart", l)
                            }
                            return t.preventDefault(), !0
                        }, e.prototype._mouseUp = function(t) {
                            var e;
                            if (document.removeEventListener("mousemove", this._mouseMove, !0), document.removeEventListener("mouseup", this._mouseUp, !0), l.isTouch && (this.dragEl.removeEventListener("touchmove", l.touchmove, !0), this.dragEl.removeEventListener("touchend", l.touchend, !0)), this.dragging) {
                                delete this.dragging, (null === (e = r.DDManager.dropElement) || void 0 === e ? void 0 : e.el) === this.el.parentElement && delete r.DDManager.dropElement, this.helperContainment.style.position = this.parentOriginStylePosition || null, this.helper === this.el ? this._removeHelperStyle() : this.helper.remove();
                                var i = s.Utils.initEvent(t, { target: this.el, type: "dragstop" });
                                this.option.stop && this.option.stop(i), this.triggerEvent("dragstop", i), r.DDManager.dropElement && r.DDManager.dropElement.drop(t)
                            }
                            delete this.helper, delete this.mouseDownEvent, delete r.DDManager.dragElement, delete r.DDManager.dropElement, delete r.DDManager.mouseHandled, t.preventDefault()
                        }, e.prototype._createHelper = function(t) {
                            var i = this,
                                o = this.el;
                            return "function" == typeof this.option.helper ? o = this.option.helper(t) : "clone" === this.option.helper && (o = s.Utils.cloneNode(this.el)), document.body.contains(o) || s.Utils.appendTo(o, "parent" === this.option.appendTo ? this.el.parentElement : this.option.appendTo), o === this.el && (this.dragElementOriginStyle = e.originStyleProp.map((function(t) { return i.el.style[t] }))), o
                        }, e.prototype._setupHelperStyle = function(t) {
                            var e = this;
                            this.helper.classList.add("ui-draggable-dragging");
                            var i = this.helper.style;
                            return i.pointerEvents = "none", i.width = this.dragOffset.width + "px", i.height = this.dragOffset.height + "px", i.willChange = "left, top", i.position = "fixed", this._dragFollow(t), i.transition = "none", setTimeout((function() { e.helper && (i.transition = null) }), 0), this
                        }, e.prototype._removeHelperStyle = function() {
                            var t, i = this;
                            this.helper.classList.remove("ui-draggable-dragging");
                            var o = null === (t = this.helper) || void 0 === t ? void 0 : t.gridstackNode;
                            if (!(null == o ? void 0 : o._isAboutToRemove) && this.dragElementOriginStyle) {
                                var n = this.helper,
                                    r = this.dragElementOriginStyle.transition || null;
                                n.style.transition = this.dragElementOriginStyle.transition = "none", e.originStyleProp.forEach((function(t) { return n.style[t] = i.dragElementOriginStyle[t] || null })), setTimeout((function() { return n.style.transition = r }), 50)
                            }
                            return delete this.dragElementOriginStyle, this
                        }, e.prototype._dragFollow = function(t) {
                            var e = this.helper.style,
                                i = this.dragOffset;
                            e.left = t.clientX + i.offsetLeft - 0 + "px", e.top = t.clientY + i.offsetTop - 0 + "px"
                        }, e.prototype._setupHelperContainmentStyle = function() { return this.helperContainment = this.helper.parentElement, "fixed" !== this.helper.style.position && (this.parentOriginStylePosition = this.helperContainment.style.position, window.getComputedStyle(this.helperContainment).position.match(/static/) && (this.helperContainment.style.position = "relative")), this }, e.prototype._getDragOffset = function(t, e, i) {
                            var o = 0,
                                n = 0;
                            if (i) {
                                var r = document.createElement("div");
                                s.Utils.addElStyles(r, { opacity: "0", position: "fixed", top: "0px", left: "0px", width: "1px", height: "1px", zIndex: "-999999" }), i.appendChild(r);
                                var a = r.getBoundingClientRect();
                                i.removeChild(r), o = a.left, n = a.top
                            }
                            var l = e.getBoundingClientRect();
                            return { left: l.left, top: l.top, offsetLeft: -t.clientX + l.left - o, offsetTop: -t.clientY + l.top - n, width: l.width, height: l.height }
                        }, e.prototype.ui = function() {
                            var t = this.el.parentElement.getBoundingClientRect(),
                                e = this.helper.getBoundingClientRect();
                            return { position: { top: e.top - t.top, left: e.left - t.left } }
                        }, e.originStyleProp = ["transition", "pointerEvents", "position", "left", "top", "minWidth", "willChange"], e
                    }(a.DDBaseImplement)
                },
                677: function(t, e, i) {
                    var o, n = this && this.__extends || (o = function(t, e) {
                            return o = Object.setPrototypeOf || { __proto__: [] }
                            instanceof Array && function(t, e) { t.__proto__ = e } || function(t, e) { for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]) }, o(t, e)
                        }, function(t, e) {
                            if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");

                            function i() { this.constructor = t }
                            o(t, e), t.prototype = null === e ? Object.create(e) : (i.prototype = e.prototype, new i)
                        }),
                        r = this && this.__assign || function() {
                            return r = Object.assign || function(t) {
                                for (var e, i = 1, o = arguments.length; i < o; i++)
                                    for (var n in e = arguments[i]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                                return t
                            }, r.apply(this, arguments)
                        };
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDDroppable = void 0;
                    var s = i(839),
                        a = i(74),
                        l = i(867),
                        d = i(537),
                        h = function(t) {
                            function e(e, i) { void 0 === i && (i = {}); var o = t.call(this) || this; return o.el = e, o.option = i, o._mouseEnter = o._mouseEnter.bind(o), o._mouseLeave = o._mouseLeave.bind(o), o.enable(), o._setupAccept(), o }
                            return n(e, t), e.prototype.on = function(e, i) { t.prototype.on.call(this, e, i) }, e.prototype.off = function(e) { t.prototype.off.call(this, e) }, e.prototype.enable = function() {!1 !== this.disabled && (t.prototype.enable.call(this), this.el.classList.add("ui-droppable"), this.el.classList.remove("ui-droppable-disabled"), this.el.addEventListener("mouseenter", this._mouseEnter), this.el.addEventListener("mouseleave", this._mouseLeave), d.isTouch && (this.el.addEventListener("pointerenter", d.pointerenter), this.el.addEventListener("pointerleave", d.pointerleave))) }, e.prototype.disable = function(e) { void 0 === e && (e = !1), !0 !== this.disabled && (t.prototype.disable.call(this), this.el.classList.remove("ui-droppable"), e || this.el.classList.add("ui-droppable-disabled"), this.el.removeEventListener("mouseenter", this._mouseEnter), this.el.removeEventListener("mouseleave", this._mouseLeave), d.isTouch && (this.el.removeEventListener("pointerenter", d.pointerenter), this.el.removeEventListener("pointerleave", d.pointerleave))) }, e.prototype.destroy = function() { this.disable(!0), this.el.classList.remove("ui-droppable"), this.el.classList.remove("ui-droppable-disabled"), t.prototype.destroy.call(this) }, e.prototype.updateOption = function(t) { var e = this; return Object.keys(t).forEach((function(i) { return e.option[i] = t[i] })), this._setupAccept(), this }, e.prototype._mouseEnter = function(t) {
                                if (s.DDManager.dragElement && this._canDrop(s.DDManager.dragElement.el)) {
                                    t.preventDefault(), t.stopPropagation(), s.DDManager.dropElement && s.DDManager.dropElement !== this && s.DDManager.dropElement._mouseLeave(t), s.DDManager.dropElement = this;
                                    var e = l.Utils.initEvent(t, { target: this.el, type: "dropover" });
                                    this.option.over && this.option.over(e, this._ui(s.DDManager.dragElement)), this.triggerEvent("dropover", e), this.el.classList.add("ui-droppable-over")
                                }
                            }, e.prototype._mouseLeave = function(t) {
                                var e;
                                if (s.DDManager.dragElement && s.DDManager.dropElement === this) {
                                    t.preventDefault(), t.stopPropagation();
                                    var i = l.Utils.initEvent(t, { target: this.el, type: "dropout" });
                                    if (this.option.out && this.option.out(i, this._ui(s.DDManager.dragElement)), this.triggerEvent("dropout", i), s.DDManager.dropElement === this) {
                                        delete s.DDManager.dropElement;
                                        for (var o = void 0, n = this.el.parentElement; !o && n;) o = null === (e = n.ddElement) || void 0 === e ? void 0 : e.ddDroppable, n = n.parentElement;
                                        o && o._mouseEnter(t)
                                    }
                                }
                            }, e.prototype.drop = function(t) {
                                t.preventDefault();
                                var e = l.Utils.initEvent(t, { target: this.el, type: "drop" });
                                this.option.drop && this.option.drop(e, this._ui(s.DDManager.dragElement)), this.triggerEvent("drop", e)
                            }, e.prototype._canDrop = function(t) { return t && (!this.accept || this.accept(t)) }, e.prototype._setupAccept = function() { var t = this; return this.option.accept ? ("string" == typeof this.option.accept ? this.accept = function(e) { return e.classList.contains(t.option.accept) || e.matches(t.option.accept) } : this.accept = this.option.accept, this) : this }, e.prototype._ui = function(t) { return r({ draggable: t.el }, t.ui()) }, e
                        }(a.DDBaseImplement);
                    e.DDDroppable = h
                },
                259: function(t, e, i) {
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDElement = void 0;
                    var o = i(904),
                        n = i(366),
                        r = i(677),
                        s = function() {
                            function t(t) { this.el = t }
                            return t.init = function(e) { return e.ddElement || (e.ddElement = new t(e)), e.ddElement }, t.prototype.on = function(t, e) { return this.ddDraggable && ["drag", "dragstart", "dragstop"].indexOf(t) > -1 ? this.ddDraggable.on(t, e) : this.ddDroppable && ["drop", "dropover", "dropout"].indexOf(t) > -1 ? this.ddDroppable.on(t, e) : this.ddResizable && ["resizestart", "resize", "resizestop"].indexOf(t) > -1 && this.ddResizable.on(t, e), this }, t.prototype.off = function(t) { return this.ddDraggable && ["drag", "dragstart", "dragstop"].indexOf(t) > -1 ? this.ddDraggable.off(t) : this.ddDroppable && ["drop", "dropover", "dropout"].indexOf(t) > -1 ? this.ddDroppable.off(t) : this.ddResizable && ["resizestart", "resize", "resizestop"].indexOf(t) > -1 && this.ddResizable.off(t), this }, t.prototype.setupDraggable = function(t) { return this.ddDraggable ? this.ddDraggable.updateOption(t) : this.ddDraggable = new n.DDDraggable(this.el, t), this }, t.prototype.cleanDraggable = function() { return this.ddDraggable && (this.ddDraggable.destroy(), delete this.ddDraggable), this }, t.prototype.setupResizable = function(t) { return this.ddResizable ? this.ddResizable.updateOption(t) : this.ddResizable = new o.DDResizable(this.el, t), this }, t.prototype.cleanResizable = function() { return this.ddResizable && (this.ddResizable.destroy(), delete this.ddResizable), this }, t.prototype.setupDroppable = function(t) { return this.ddDroppable ? this.ddDroppable.updateOption(t) : this.ddDroppable = new r.DDDroppable(this.el, t), this }, t.prototype.cleanDroppable = function() { return this.ddDroppable && (this.ddDroppable.destroy(), delete this.ddDroppable), this }, t
                        }();
                    e.DDElement = s
                },
                502: function(t, e, i) {
                    var o = this && this.__assign || function() {
                        return o = Object.assign || function(t) {
                            for (var e, i = 1, o = arguments.length; i < o; i++)
                                for (var n in e = arguments[i]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                            return t
                        }, o.apply(this, arguments)
                    };
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDGridStack = void 0;
                    var n = i(867),
                        r = i(839),
                        s = i(259),
                        a = function() {
                            function t() {}
                            return t.prototype.resizable = function(t, e, i, n) {
                                return this._getDDElements(t).forEach((function(t) {
                                    var r;
                                    if ("disable" === e || "enable" === e) t.ddResizable && t.ddResizable[e]();
                                    else if ("destroy" === e) t.ddResizable && t.cleanResizable();
                                    else if ("option" === e) t.setupResizable(((r = {})[i] = n, r));
                                    else {
                                        var s = t.el.gridstackNode.grid,
                                            a = t.el.getAttribute("gs-resize-handles") ? t.el.getAttribute("gs-resize-handles") : s.opts.resizable.handles,
                                            l = !s.opts.alwaysShowResizeHandle;
                                        t.setupResizable(o(o(o({}, s.opts.resizable), { handles: a, autoHide: l }), { start: e.start, stop: e.stop, resize: e.resize }))
                                    }
                                })), this
                            }, t.prototype.draggable = function(t, e, i, n) {
                                return this._getDDElements(t).forEach((function(t) {
                                    var r;
                                    if ("disable" === e || "enable" === e) t.ddDraggable && t.ddDraggable[e]();
                                    else if ("destroy" === e) t.ddDraggable && t.cleanDraggable();
                                    else if ("option" === e) t.setupDraggable(((r = {})[i] = n, r));
                                    else {
                                        var s = t.el.gridstackNode.grid;
                                        t.setupDraggable(o(o({}, s.opts.draggable), { start: e.start, stop: e.stop, drag: e.drag }))
                                    }
                                })), this
                            }, t.prototype.dragIn = function(t, e) { return this._getDDElements(t).forEach((function(t) { return t.setupDraggable(e) })), this }, t.prototype.droppable = function(t, e, i, o) { return "function" != typeof e.accept || e._accept || (e._accept = e.accept, e.accept = function(t) { return e._accept(t) }), this._getDDElements(t).forEach((function(t) { var n; "disable" === e || "enable" === e ? t.ddDroppable && t.ddDroppable[e]() : "destroy" === e ? t.ddDroppable && t.cleanDroppable() : "option" === e ? t.setupDroppable(((n = {})[i] = o, n)) : t.setupDroppable(e) })), this }, t.prototype.isDroppable = function(t) { return !(!(t && t.ddElement && t.ddElement.ddDroppable) || t.ddElement.ddDroppable.disabled) }, t.prototype.isDraggable = function(t) { return !(!(t && t.ddElement && t.ddElement.ddDraggable) || t.ddElement.ddDraggable.disabled) }, t.prototype.isResizable = function(t) { return !(!(t && t.ddElement && t.ddElement.ddResizable) || t.ddElement.ddResizable.disabled) }, t.prototype.on = function(t, e, i) { return this._getDDElements(t).forEach((function(t) { return t.on(e, (function(t) { i(t, r.DDManager.dragElement ? r.DDManager.dragElement.el : t.target, r.DDManager.dragElement ? r.DDManager.dragElement.helper : null) })) })), this }, t.prototype.off = function(t, e) { return this._getDDElements(t).forEach((function(t) { return t.off(e) })), this }, t.prototype._getDDElements = function(t, e) { void 0 === e && (e = !0); var i = n.Utils.getElements(t); if (!i.length) return []; var o = i.map((function(t) { return t.ddElement || (e ? s.DDElement.init(t) : null) })); return e || o.filter((function(t) { return t })), o }, t
                        }();
                    e.DDGridStack = a
                },
                839: function(t, e) {
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDManager = void 0;
                    e.DDManager = function() {}
                },
                664: function(t, e, i) {
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDResizableHandle = void 0;
                    var o = i(537);
                    e.DDResizableHandle = function() {
                        function t(t, e, i) { this.moving = !1, this.host = t, this.dir = e, this.option = i, this._mouseDown = this._mouseDown.bind(this), this._mouseMove = this._mouseMove.bind(this), this._mouseUp = this._mouseUp.bind(this), this._init() }
                        return t.prototype._init = function() { var e = document.createElement("div"); return e.classList.add("ui-resizable-handle"), e.classList.add("".concat(t.prefix).concat(this.dir)), e.style.zIndex = "100", e.style.userSelect = "none", this.el = e, this.host.appendChild(this.el), this.el.addEventListener("mousedown", this._mouseDown), o.isTouch && (this.el.addEventListener("touchstart", o.touchstart), this.el.addEventListener("pointerdown", o.pointerdown)), this }, t.prototype.destroy = function() { return this.moving && this._mouseUp(this.mouseDownEvent), this.el.removeEventListener("mousedown", this._mouseDown), o.isTouch && (this.el.removeEventListener("touchstart", o.touchstart), this.el.removeEventListener("pointerdown", o.pointerdown)), this.host.removeChild(this.el), delete this.el, delete this.host, this }, t.prototype._mouseDown = function(t) { this.mouseDownEvent = t, document.addEventListener("mousemove", this._mouseMove, !0), document.addEventListener("mouseup", this._mouseUp, !0), o.isTouch && (this.el.addEventListener("touchmove", o.touchmove), this.el.addEventListener("touchend", o.touchend)), t.stopPropagation(), t.preventDefault() }, t.prototype._mouseMove = function(t) {
                            var e = this.mouseDownEvent;
                            this.moving ? this._triggerEvent("move", t) : Math.abs(t.x - e.x) + Math.abs(t.y - e.y) > 2 && (this.moving = !0, this._triggerEvent("start", this.mouseDownEvent), this._triggerEvent("move", t)), t.stopPropagation(), t.preventDefault()
                        }, t.prototype._mouseUp = function(t) { this.moving && this._triggerEvent("stop", t), document.removeEventListener("mousemove", this._mouseMove, !0), document.removeEventListener("mouseup", this._mouseUp, !0), o.isTouch && (this.el.removeEventListener("touchmove", o.touchmove), this.el.removeEventListener("touchend", o.touchend)), delete this.moving, delete this.mouseDownEvent, t.stopPropagation(), t.preventDefault() }, t.prototype._triggerEvent = function(t, e) { return this.option[t] && this.option[t](e), this }, t.prefix = "ui-resizable-", t
                    }()
                },
                904: function(t, e, i) {
                    var o, n = this && this.__extends || (o = function(t, e) {
                        return o = Object.setPrototypeOf || { __proto__: [] }
                        instanceof Array && function(t, e) { t.__proto__ = e } || function(t, e) { for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]) }, o(t, e)
                    }, function(t, e) {
                        if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");

                        function i() { this.constructor = t }
                        o(t, e), t.prototype = null === e ? Object.create(e) : (i.prototype = e.prototype, new i)
                    });
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.DDResizable = void 0;
                    var r = i(664),
                        s = i(74),
                        a = i(867),
                        l = i(839);
                    e.DDResizable = function(t) {
                        function e(e, i) {
                            void 0 === i && (i = {});
                            var o = t.call(this) || this;
                            return o._ui = function() {
                                var t = o.el.parentElement.getBoundingClientRect(),
                                    e = { width: o.originalRect.width, height: o.originalRect.height + o.scrolled, left: o.originalRect.left, top: o.originalRect.top - o.scrolled },
                                    i = o.temporalRect || e;
                                return { position: { left: i.left - t.left, top: i.top - t.top }, size: { width: i.width, height: i.height } }
                            }, o.el = e, o.option = i, o._mouseOver = o._mouseOver.bind(o), o._mouseOut = o._mouseOut.bind(o), o.enable(), o._setupAutoHide(o.option.autoHide), o._setupHandlers(), o
                        }
                        return n(e, t), e.prototype.on = function(e, i) { t.prototype.on.call(this, e, i) }, e.prototype.off = function(e) { t.prototype.off.call(this, e) }, e.prototype.enable = function() { t.prototype.enable.call(this), this.el.classList.remove("ui-resizable-disabled"), this._setupAutoHide(this.option.autoHide) }, e.prototype.disable = function() { t.prototype.disable.call(this), this.el.classList.add("ui-resizable-disabled"), this._setupAutoHide(!1) }, e.prototype.destroy = function() { this._removeHandlers(), this._setupAutoHide(!1), delete this.el, t.prototype.destroy.call(this) }, e.prototype.updateOption = function(t) {
                            var e = this,
                                i = t.handles && t.handles !== this.option.handles,
                                o = t.autoHide && t.autoHide !== this.option.autoHide;
                            return Object.keys(t).forEach((function(i) { return e.option[i] = t[i] })), i && (this._removeHandlers(), this._setupHandlers()), o && this._setupAutoHide(this.option.autoHide), this
                        }, e.prototype._setupAutoHide = function(t) { return t ? (this.el.classList.add("ui-resizable-autohide"), this.el.addEventListener("mouseover", this._mouseOver), this.el.addEventListener("mouseout", this._mouseOut)) : (this.el.classList.remove("ui-resizable-autohide"), this.el.removeEventListener("mouseover", this._mouseOver), this.el.removeEventListener("mouseout", this._mouseOut), l.DDManager.overResizeElement === this && delete l.DDManager.overResizeElement), this }, e.prototype._mouseOver = function(t) { l.DDManager.overResizeElement || l.DDManager.dragElement || (l.DDManager.overResizeElement = this, this.el.classList.remove("ui-resizable-autohide")) }, e.prototype._mouseOut = function(t) { l.DDManager.overResizeElement === this && (delete l.DDManager.overResizeElement, this.el.classList.add("ui-resizable-autohide")) }, e.prototype._setupHandlers = function() {
                            var t = this,
                                e = this.option.handles || "e,s,se";
                            return "all" === e && (e = "n,e,s,w,se,sw,ne,nw"), this.handlers = e.split(",").map((function(t) { return t.trim() })).map((function(e) { return new r.DDResizableHandle(t.el, e, { start: function(e) { t._resizeStart(e) }, stop: function(e) { t._resizeStop(e) }, move: function(i) { t._resizing(i, e) } }) })), this
                        }, e.prototype._resizeStart = function(t) { this.originalRect = this.el.getBoundingClientRect(), this.scrollEl = a.Utils.getScrollElement(this.el), this.scrollY = this.scrollEl.scrollTop, this.scrolled = 0, this.startEvent = t, this._setupHelper(), this._applyChange(); var e = a.Utils.initEvent(t, { type: "resizestart", target: this.el }); return this.option.start && this.option.start(e, this._ui()), this.el.classList.add("ui-resizable-resizing"), this.triggerEvent("resizestart", e), this }, e.prototype._resizing = function(t, e) { this.scrolled = this.scrollEl.scrollTop - this.scrollY, this.temporalRect = this._getChange(t, e), this._applyChange(); var i = a.Utils.initEvent(t, { type: "resize", target: this.el }); return this.option.resize && this.option.resize(i, this._ui()), this.triggerEvent("resize", i), this }, e.prototype._resizeStop = function(t) { var e = a.Utils.initEvent(t, { type: "resizestop", target: this.el }); return this.option.stop && this.option.stop(e), this.el.classList.remove("ui-resizable-resizing"), this.triggerEvent("resizestop", e), this._cleanHelper(), delete this.startEvent, delete this.originalRect, delete this.temporalRect, delete this.scrollY, delete this.scrolled, this }, e.prototype._setupHelper = function() { var t = this; return this.elOriginStyleVal = e._originStyleProp.map((function(e) { return t.el.style[e] })), this.parentOriginStylePosition = this.el.parentElement.style.position, window.getComputedStyle(this.el.parentElement).position.match(/static/) && (this.el.parentElement.style.position = "relative"), this.el.style.position = "absolute", this.el.style.opacity = "0.8", this }, e.prototype._cleanHelper = function() { var t = this; return e._originStyleProp.forEach((function(e, i) { t.el.style[e] = t.elOriginStyleVal[i] || null })), this.el.parentElement.style.position = this.parentOriginStylePosition || null, this }, e.prototype._getChange = function(t, e) {
                            var i = this.startEvent,
                                o = { width: this.originalRect.width, height: this.originalRect.height + this.scrolled, left: this.originalRect.left, top: this.originalRect.top - this.scrolled },
                                n = t.clientX - i.clientX,
                                r = t.clientY - i.clientY;
                            e.indexOf("e") > -1 ? o.width += n : e.indexOf("w") > -1 && (o.width -= n, o.left += n), e.indexOf("s") > -1 ? o.height += r : e.indexOf("n") > -1 && (o.height -= r, o.top += r);
                            var s = this._constrainSize(o.width, o.height);
                            return Math.round(o.width) !== Math.round(s.width) && (e.indexOf("w") > -1 && (o.left += o.width - s.width), o.width = s.width), Math.round(o.height) !== Math.round(s.height) && (e.indexOf("n") > -1 && (o.top += o.height - s.height), o.height = s.height), o
                        }, e.prototype._constrainSize = function(t, e) {
                            var i = this.option.maxWidth || Number.MAX_SAFE_INTEGER,
                                o = this.option.minWidth || t,
                                n = this.option.maxHeight || Number.MAX_SAFE_INTEGER,
                                r = this.option.minHeight || e;
                            return { width: Math.min(i, Math.max(o, t)), height: Math.min(n, Math.max(r, e)) }
                        }, e.prototype._applyChange = function() {
                            var t, e = this,
                                i = { left: 0, top: 0, width: 0, height: 0 };
                            if ("absolute" === this.el.style.position) {
                                var o = (t = this.el.parentElement.getBoundingClientRect()).left,
                                    n = t.top;
                                i = { left: o, top: n, width: 0, height: 0 }
                            }
                            return this.temporalRect ? (Object.keys(this.temporalRect).forEach((function(t) {
                                var o = e.temporalRect[t];
                                e.el.style[t] = o - i[t] + "px"
                            })), this) : this
                        }, e.prototype._removeHandlers = function() { return this.handlers.forEach((function(t) { return t.destroy() })), delete this.handlers, this }, e._originStyleProp = ["width", "height", "position", "left", "top", "opacity", "zIndex"], e
                    }(s.DDBaseImplement)
                },
                537: function(t, e, i) {
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.pointerleave = e.pointerenter = e.pointerdown = e.touchend = e.touchmove = e.touchstart = e.isTouch = void 0;
                    var o = i(839);
                    e.isTouch = "undefined" != typeof window && "undefined" != typeof document && ("ontouchstart" in document || "ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
                    var n = function() {};

                    function r(t, e) {
                        if (!(t.touches.length > 1)) {
                            t.cancelable && t.preventDefault();
                            var i = t.changedTouches[0],
                                o = document.createEvent("MouseEvents");
                            o.initMouseEvent(e, !0, !0, window, 1, i.screenX, i.screenY, i.clientX, i.clientY, !1, !1, !1, !1, 0, null), t.target.dispatchEvent(o)
                        }
                    }

                    function s(t, e) {
                        t.cancelable && t.preventDefault();
                        var i = document.createEvent("MouseEvents");
                        i.initMouseEvent(e, !0, !0, window, 1, t.screenX, t.screenY, t.clientX, t.clientY, !1, !1, !1, !1, 0, null), t.target.dispatchEvent(i)
                    }
                    e.touchstart = function(t) { n.touchHandled || (n.touchHandled = !0, r(t, "mousedown")) }, e.touchmove = function(t) { n.touchHandled && r(t, "mousemove") }, e.touchend = function(t) {
                        if (n.touchHandled) {
                            n.pointerLeaveTimeout && (window.clearTimeout(n.pointerLeaveTimeout), delete n.pointerLeaveTimeout);
                            var e = !!o.DDManager.dragElement;
                            r(t, "mouseup"), e || r(t, "click"), n.touchHandled = !1
                        }
                    }, e.pointerdown = function(t) { t.target.releasePointerCapture(t.pointerId) }, e.pointerenter = function(t) { o.DDManager.dragElement && s(t, "mouseenter") }, e.pointerleave = function(t) { o.DDManager.dragElement && (n.pointerLeaveTimeout = window.setTimeout((function() { delete n.pointerLeaveTimeout, s(t, "mouseleave") }), 10)) }
                },
                506: function(t, e, i) {
                    var o = this && this.__assign || function() {
                        return o = Object.assign || function(t) {
                            for (var e, i = 1, o = arguments.length; i < o; i++)
                                for (var n in e = arguments[i]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                            return t
                        }, o.apply(this, arguments)
                    };
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.GridStackEngine = void 0;
                    var n = i(867);
                    e.GridStackEngine = function() {
                        function t(t) { void 0 === t && (t = {}), this.addedNodes = [], this.removedNodes = [], this.column = t.column || 12, this.maxRow = t.maxRow, this._float = t.float, this.nodes = t.nodes || [], this.onChange = t.onChange }
                        return t.prototype.batchUpdate = function(t, e) { return void 0 === t && (t = !0), void 0 === e && (e = !0), !!this.batchMode === t || (this.batchMode = t, t ? (this._prevFloat = this._float, this._float = !0, this.saveInitial()) : (this._float = this._prevFloat, delete this._prevFloat, e && this._packNodes(), this._notify())), this }, t.prototype._useEntireRowArea = function(t, e) { return (!this.float || this.batchMode && !this._prevFloat) && !this._hasLocked && (!t._moving || t._skipDown || e.y <= t.y) }, t.prototype._fixCollisions = function(t, e, i, r) {
                            if (void 0 === e && (e = t), void 0 === r && (r = {}), this.sortNodes(-1), !(i = i || this.collide(t, e))) return !1;
                            if (t._moving && !r.nested && !this.float && this.swap(t, i)) return !0;
                            var s = e;
                            this._useEntireRowArea(t, e) && (s = { x: 0, w: this.column, y: e.y, h: e.h }, i = this.collide(t, s, r.skip));
                            for (var a = !1, l = { nested: !0, pack: !1 }; i = i || this.collide(t, s, r.skip);) {
                                var d = void 0;
                                if (i.locked || t._moving && !t._skipDown && e.y > t.y && !this.float && (!this.collide(i, o(o({}, i), { y: t.y }), t) || !this.collide(i, o(o({}, i), { y: e.y - i.h }), t)) ? (t._skipDown = t._skipDown || e.y > t.y, d = this.moveNode(t, o(o(o({}, e), { y: i.y + i.h }), l)), i.locked && d ? n.Utils.copyPos(e, t) : !i.locked && d && r.pack && (this._packNodes(), e.y = i.y + i.h, n.Utils.copyPos(t, e)), a = a || d) : d = this.moveNode(i, o(o(o({}, i), { y: e.y + e.h, skip: t }), l)), !d) return a;
                                i = void 0
                            }
                            return a
                        }, t.prototype.collide = function(t, e, i) {
                            void 0 === e && (e = t);
                            var o = t._id,
                                r = null == i ? void 0 : i._id;
                            return this.nodes.find((function(t) { return t._id !== o && t._id !== r && n.Utils.isIntercepted(t, e) }))
                        }, t.prototype.collideAll = function(t, e, i) {
                            void 0 === e && (e = t);
                            var o = t._id,
                                r = null == i ? void 0 : i._id;
                            return this.nodes.filter((function(t) { return t._id !== o && t._id !== r && n.Utils.isIntercepted(t, e) }))
                        }, t.prototype.directionCollideCoverage = function(t, e, i) {
                            if (e.rect && t._rect) {
                                var n, r = t._rect,
                                    s = o({}, e.rect);
                                return s.y > r.y ? (s.h += s.y - r.y, s.y = r.y) : s.h += r.y - s.y, s.x > r.x ? (s.w += s.x - r.x, s.x = r.x) : s.w += r.x - s.x, i.forEach((function(t) {
                                    if (!t.locked && t._rect) {
                                        var e = t._rect,
                                            i = Number.MAX_VALUE,
                                            o = Number.MAX_VALUE,
                                            a = .5;
                                        r.y < e.y ? i = (s.y + s.h - e.y) / e.h : r.y + r.h > e.y + e.h && (i = (e.y + e.h - s.y) / e.h), r.x < e.x ? o = (s.x + s.w - e.x) / e.w : r.x + r.w > e.x + e.w && (o = (e.x + e.w - s.x) / e.w);
                                        var l = Math.min(o, i);
                                        l > a && (a = l, n = t)
                                    }
                                })), e.collide = n, n
                            }
                        }, t.prototype.cacheRects = function(t, e, i, o, n, r) { return this.nodes.forEach((function(s) { return s._rect = { y: s.y * e + i, x: s.x * t + r, w: s.w * t - r - o, h: s.h * e - i - n } })), this }, t.prototype.swap = function(t, e) {
                            if (!e || e.locked || !t || t.locked) return !1;

                            function i() {
                                var i = e.x,
                                    o = e.y;
                                return e.x = t.x, e.y = t.y, t.h != e.h ? (t.x = i, t.y = e.y + e.h) : t.w != e.w ? (t.x = e.x + e.w, t.y = o) : (t.x = i, t.y = o), t._dirty = e._dirty = !0, !0
                            }
                            var o;
                            if (t.w === e.w && t.h === e.h && (t.x === e.x || t.y === e.y) && (o = n.Utils.isTouching(t, e))) return i();
                            if (!1 !== o) {
                                if (t.w === e.w && t.x === e.x && (o || (o = n.Utils.isTouching(t, e)))) {
                                    if (e.y < t.y) {
                                        var r = t;
                                        t = e, e = r
                                    }
                                    return i()
                                }
                                if (!1 !== o) return !(t.h !== e.h || t.y !== e.y || !o && !(o = n.Utils.isTouching(t, e))) && (e.x < t.x && (r = t, t = e, e = r), i())
                            }
                        }, t.prototype.isAreaEmpty = function(t, e, i, o) { var n = { x: t || 0, y: e || 0, w: i || 1, h: o || 1 }; return !this.collide(n) }, t.prototype.compact = function(t, e) {
                            var i = this;
                            if (void 0 === t && (t = "compact"), void 0 === e && (e = !0), 0 === this.nodes.length) return this;
                            e && this.sortNodes();
                            var o = this.batchMode;
                            o || this.batchUpdate();
                            var n = this._inColumnResize;
                            n || (this._inColumnResize = !0);
                            var r = this.nodes;
                            return this.nodes = [], r.forEach((function(e, o, n) {
                                var r;
                                e.locked || (e.autoPosition = !0, "list" === t && o && (r = n[o - 1])), i.addNode(e, !1, r)
                            })), n || delete this._inColumnResize, o || this.batchUpdate(!1), this
                        }, Object.defineProperty(t.prototype, "float", { get: function() { return this._float || !1 }, set: function(t) { this._float !== t && (this._float = t || !1, t || this._packNodes()._notify()) }, enumerable: !1, configurable: !0 }), t.prototype.sortNodes = function(t, e) { return void 0 === t && (t = 1), void 0 === e && (e = this.column), this.nodes = n.Utils.sort(this.nodes, t, e), this }, t.prototype._packNodes = function() {
                            var t = this;
                            return this.batchMode || (this.sortNodes(), this.float ? this.nodes.forEach((function(e) {
                                if (!e._updating && void 0 !== e._orig && e.y !== e._orig.y)
                                    for (var i = e.y; i > e._orig.y;) --i, t.collide(e, { x: e.x, y: i, w: e.w, h: e.h }) || (e._dirty = !0, e.y = i)
                            })) : this.nodes.forEach((function(e, i) {
                                if (!e.locked)
                                    for (; e.y > 0;) {
                                        var o = 0 === i ? 0 : e.y - 1;
                                        if (0 !== i && t.collide(e, { x: e.x, y: o, w: e.w, h: e.h })) break;
                                        e._dirty = e.y !== o, e.y = o
                                    }
                            }))), this
                        }, t.prototype.prepareNode = function(e, i) {
                            var o;
                            (e = e || {})._id = null !== (o = e._id) && void 0 !== o ? o : t._idSeq++, void 0 !== e.x && void 0 !== e.y && null !== e.x && null !== e.y || (e.autoPosition = !0);
                            var r = { x: 0, y: 0, w: 1, h: 1 };
                            return n.Utils.defaults(e, r), e.autoPosition || delete e.autoPosition, e.noResize || delete e.noResize, e.noMove || delete e.noMove, n.Utils.sanitizeMinMax(e), "string" == typeof e.x && (e.x = Number(e.x)), "string" == typeof e.y && (e.y = Number(e.y)), "string" == typeof e.w && (e.w = Number(e.w)), "string" == typeof e.h && (e.h = Number(e.h)), isNaN(e.x) && (e.x = r.x, e.autoPosition = !0), isNaN(e.y) && (e.y = r.y, e.autoPosition = !0), isNaN(e.w) && (e.w = r.w), isNaN(e.h) && (e.h = r.h), this.nodeBoundFix(e, i)
                        }, t.prototype.nodeBoundFix = function(t, e) {
                            var i = t._orig || n.Utils.copyPos({}, t);
                            if (t.maxW && (t.w = Math.min(t.w, t.maxW)), t.maxH && (t.h = Math.min(t.h, t.maxH)), t.minW && t.minW <= this.column && (t.w = Math.max(t.w, t.minW)), t.minH && (t.h = Math.max(t.h, t.minH)), (1 === this.column || t.x + t.w > this.column) && this.column < 12 && !this._inColumnResize && t._id && -1 === this.findCacheLayout(t, 12)) {
                                var r = o({}, t);
                                r.autoPosition ? (delete r.x, delete r.y) : r.x = Math.min(11, r.x), r.w = Math.min(12, r.w), this.cacheOneLayout(r, 12)
                            }
                            return t.w > this.column ? t.w = this.column : t.w < 1 && (t.w = 1), this.maxRow && t.h > this.maxRow ? t.h = this.maxRow : t.h < 1 && (t.h = 1), t.x < 0 && (t.x = 0), t.y < 0 && (t.y = 0), t.x + t.w > this.column && (e ? t.w = this.column - t.x : t.x = this.column - t.w), this.maxRow && t.y + t.h > this.maxRow && (e ? t.h = this.maxRow - t.y : t.y = this.maxRow - t.h), n.Utils.samePos(t, i) || (t._dirty = !0), t
                        }, t.prototype.getDirtyNodes = function(t) { return t ? this.nodes.filter((function(t) { return t._dirty && !n.Utils.samePos(t, t._orig) })) : this.nodes.filter((function(t) { return t._dirty })) }, t.prototype._notify = function(t) { if (this.batchMode || !this.onChange) return this; var e = (t || []).concat(this.getDirtyNodes()); return this.onChange(e), this }, t.prototype.cleanNodes = function() { return this.batchMode || this.nodes.forEach((function(t) { delete t._dirty, delete t._lastTried })), this }, t.prototype.saveInitial = function() { return this.nodes.forEach((function(t) { t._orig = n.Utils.copyPos({}, t), delete t._dirty })), this._hasLocked = this.nodes.some((function(t) { return t.locked })), this }, t.prototype.restoreInitial = function() { return this.nodes.forEach((function(t) { n.Utils.samePos(t, t._orig) || (n.Utils.copyPos(t, t._orig), t._dirty = !0) })), this._notify(), this }, t.prototype.findEmptyPosition = function(t, e, i, o) {
                            void 0 === e && (e = this.nodes), void 0 === i && (i = this.column);
                            for (var r = o ? o.y * i + (o.x + o.w) : 0, s = !1, a = function(o) {
                                    var r = o % i,
                                        a = Math.floor(o / i);
                                    if (r + t.w > i) return "continue";
                                    var l = { x: r, y: a, w: t.w, h: t.h };
                                    e.find((function(t) { return n.Utils.isIntercepted(l, t) })) || (t.x === r && t.y === a || (t._dirty = !0), t.x = r, t.y = a, delete t.autoPosition, s = !0)
                                }, l = r; !s; ++l) a(l);
                            return s
                        }, t.prototype.addNode = function(t, e, i) { var o; return void 0 === e && (e = !1), this.nodes.find((function(e) { return e._id === t._id })) || (delete(t = this._inColumnResize ? this.nodeBoundFix(t) : this.prepareNode(t))._temporaryRemoved, delete t._removeDOM, t.autoPosition && this.findEmptyPosition(t, this.nodes, this.column, i) && (delete t.autoPosition, o = !0), this.nodes.push(t), e && this.addedNodes.push(t), o || this._fixCollisions(t), this.batchMode || this._packNodes()._notify(), t) }, t.prototype.removeNode = function(t, e, i) { return void 0 === e && (e = !0), void 0 === i && (i = !1), this.nodes.find((function(e) { return e._id === t._id })) ? (i && this.removedNodes.push(t), e && (t._removeDOM = !0), this.nodes = this.nodes.filter((function(e) { return e._id !== t._id })), t._isAboutToRemove || this._packNodes(), this._notify([t]), this) : this }, t.prototype.removeAll = function(t) { return void 0 === t && (t = !0), delete this._layouts, this.nodes.length ? (t && this.nodes.forEach((function(t) { return t._removeDOM = !0 })), this.removedNodes = this.nodes, this.nodes = [], this._notify(this.removedNodes)) : this }, t.prototype.moveNodeCheck = function(e, i) {
                            var r, s = this;
                            if (!this.changedPosConstrain(e, i)) return !1;
                            if (i.pack = !0, !this.maxRow) return this.moveNode(e, i);
                            var a = new t({ column: this.column, float: this.float, nodes: this.nodes.map((function(t) { return t._id === e._id ? r = o({}, t) : o({}, t) })) });
                            if (!r) return !1;
                            var l = a.moveNode(r, i) && a.getRow() <= this.maxRow;
                            if (!l && !i.resizing && i.collide) { var d = i.collide.el.gridstackNode; if (this.swap(e, d)) return this._notify(), !0 }
                            return !!l && (a.nodes.filter((function(t) { return t._dirty })).forEach((function(t) {
                                var e = s.nodes.find((function(e) { return e._id === t._id }));
                                e && (n.Utils.copyPos(e, t), e._dirty = !0)
                            })), this._notify(), !0)
                        }, t.prototype.willItFit = function(e) {
                            if (delete e._willFitPos, !this.maxRow) return !0;
                            var i = new t({ column: this.column, float: this.float, nodes: this.nodes.map((function(t) { return o({}, t) })) }),
                                r = o({}, e);
                            return this.cleanupNode(r), delete r.el, delete r._id, delete r.content, delete r.grid, i.addNode(r), i.getRow() <= this.maxRow && (e._willFitPos = n.Utils.copyPos({}, r), !0)
                        }, t.prototype.changedPosConstrain = function(t, e) { return e.w = e.w || t.w, e.h = e.h || t.h, t.x !== e.x || t.y !== e.y || (t.maxW && (e.w = Math.min(e.w, t.maxW)), t.maxH && (e.h = Math.min(e.h, t.maxH)), t.minW && (e.w = Math.max(e.w, t.minW)), t.minH && (e.h = Math.max(e.h, t.minH)), t.w !== e.w || t.h !== e.h) }, t.prototype.moveNode = function(t, e) {
                            var i, o, r;
                            if (!t || !e) return !1;
                            void 0 === e.pack && (r = e.pack = !0), "number" != typeof e.x && (e.x = t.x), "number" != typeof e.y && (e.y = t.y), "number" != typeof e.w && (e.w = t.w), "number" != typeof e.h && (e.h = t.h);
                            var s = t.w !== e.w || t.h !== e.h,
                                a = n.Utils.copyPos({}, t, !0);
                            if (n.Utils.copyPos(a, e), a = this.nodeBoundFix(a, s), n.Utils.copyPos(e, a), n.Utils.samePos(t, e)) return !1;
                            var l = n.Utils.copyPos({}, t),
                                d = this.collideAll(t, a, e.skip),
                                h = !0;
                            if (d.length) {
                                var u = t._moving && !e.nested,
                                    p = u ? this.directionCollideCoverage(t, e, d) : d[0];
                                if (u && p && (null === (o = null === (i = t.grid) || void 0 === i ? void 0 : i.opts) || void 0 === o ? void 0 : o.subGridDynamic) && !t.grid._isTemp) {
                                    var c = n.Utils.areaIntercept(e.rect, p._rect),
                                        g = n.Utils.area(e.rect),
                                        m = n.Utils.area(p._rect);
                                    c / (g < m ? g : m) > .8 && (p.grid.makeSubGrid(p.el, void 0, t), p = void 0)
                                }
                                p ? h = !this._fixCollisions(t, a, p, e) : (h = !1, r && delete e.pack)
                            }
                            return h && (t._dirty = !0, n.Utils.copyPos(t, a)), e.pack && this._packNodes()._notify(), !n.Utils.samePos(t, l)
                        }, t.prototype.getRow = function() { return this.nodes.reduce((function(t, e) { return Math.max(t, e.y + e.h) }), 0) }, t.prototype.beginUpdate = function(t) { return t._updating || (t._updating = !0, delete t._skipDown, this.batchMode || this.saveInitial()), this }, t.prototype.endUpdate = function() { var t = this.nodes.find((function(t) { return t._updating })); return t && (delete t._updating, delete t._skipDown), this }, t.prototype.save = function(t, e) {
                            var i;
                            void 0 === t && (t = !0);
                            var r = null === (i = this._layouts) || void 0 === i ? void 0 : i.length,
                                s = r && this.column !== r - 1 ? this._layouts[r - 1] : null,
                                a = [];
                            return this.sortNodes(), this.nodes.forEach((function(i) {
                                var r = null == s ? void 0 : s.find((function(t) { return t._id === i._id })),
                                    l = o({}, i);
                                r && (l.x = r.x, l.y = r.y, l.w = r.w), n.Utils.removeInternalForSave(l, !t), e && e(i, l), a.push(l)
                            })), a
                        }, t.prototype.layoutsNodesChange = function(t) {
                            var e = this;
                            return !this._layouts || this._inColumnResize || this._layouts.forEach((function(i, o) {
                                if (!i || o === e.column) return e;
                                if (o < e.column) e._layouts[o] = void 0;
                                else {
                                    var n = o / e.column;
                                    t.forEach((function(t) {
                                        if (t._orig) {
                                            var e = i.find((function(e) { return e._id === t._id }));
                                            e && (t.y !== t._orig.y && (e.y += t.y - t._orig.y), t.x !== t._orig.x && (e.x = Math.round(t.x * n)), t.w !== t._orig.w && (e.w = Math.round(t.w * n)))
                                        }
                                    }))
                                }
                            })), this
                        }, t.prototype.columnChanged = function(t, e, i, o) {
                            var r, s = this;
                            if (void 0 === o && (o = "moveScale"), !this.nodes.length || !e || t === e) return this;
                            var a = "compact" === o || "list" === o;
                            a && this.sortNodes(1, t), e < t && this.cacheLayout(this.nodes, t), this.batchUpdate();
                            var l = [],
                                d = !1;
                            if (1 === e && (null == i ? void 0 : i.length)) {
                                d = !0;
                                var h = 0;
                                i.forEach((function(t) { t.x = 0, t.w = 1, t.y = Math.max(t.y, h), h = t.y + t.h })), l = i, i = []
                            } else i = a ? this.nodes : n.Utils.sort(this.nodes, -1, t);
                            if (e > t && this._layouts) {
                                var u = this._layouts[e] || [],
                                    p = this._layouts.length - 1;
                                !u.length && t !== p && (null === (r = this._layouts[p]) || void 0 === r ? void 0 : r.length) && (t = p, this._layouts[p].forEach((function(t) {
                                    var e = i.find((function(e) { return e._id === t._id }));
                                    e && (a || (e.x = t.x, e.y = t.y), e.w = t.w)
                                }))), u.forEach((function(t) {
                                    var e = i.findIndex((function(e) { return e._id === t._id }));
                                    if (-1 !== e) {
                                        if (a) return void(i[e].w = t.w);
                                        (t.autoPosition || isNaN(t.x) || isNaN(t.y)) && s.findEmptyPosition(t, l), t.autoPosition || (i[e].x = t.x, i[e].y = t.y, i[e].w = t.w, l.push(i[e])), i.splice(e, 1)
                                    }
                                }))
                            }
                            if (a) this.compact(o, !1);
                            else {
                                if (i.length)
                                    if ("function" == typeof o) o(e, t, l, i);
                                    else if (!d) {
                                    var c = a || "none" === o ? 1 : e / t,
                                        g = "move" === o || "moveScale" === o,
                                        m = "scale" === o || "moveScale" === o;
                                    i.forEach((function(i) { i.x = 1 === e ? 0 : g ? Math.round(i.x * c) : Math.min(i.x, e - 1), i.w = 1 === e || 1 === t ? 1 : m ? Math.round(i.w * c) || 1 : Math.min(i.w, e), l.push(i) })), i = []
                                }
                                d || (l = n.Utils.sort(l, -1, e)), this._inColumnResize = !0, this.nodes = [], l.forEach((function(t) { s.addNode(t, !1), delete t._orig }))
                            }
                            return this.nodes.forEach((function(t) { return delete t._orig })), this.batchUpdate(!1, !a), delete this._inColumnResize, this
                        }, t.prototype.cacheLayout = function(e, i, o) {
                            void 0 === o && (o = !1);
                            var n = [];
                            return e.forEach((function(e, i) {
                                var o;
                                e._id = null !== (o = e._id) && void 0 !== o ? o : t._idSeq++, n[i] = { x: e.x, y: e.y, w: e.w, _id: e._id }
                            })), this._layouts = o ? [] : this._layouts || [], this._layouts[i] = n, this
                        }, t.prototype.cacheOneLayout = function(e, i) {
                            var o;
                            e._id = null !== (o = e._id) && void 0 !== o ? o : t._idSeq++;
                            var n = { x: e.x, y: e.y, w: e.w, _id: e._id };
                            e.autoPosition && (delete n.x, delete n.y, n.autoPosition = !0), this._layouts = this._layouts || [], this._layouts[i] = this._layouts[i] || [];
                            var r = this.findCacheLayout(e, i);
                            return -1 === r ? this._layouts[i].push(n) : this._layouts[i][r] = n, this
                        }, t.prototype.findCacheLayout = function(t, e) { var i, o, n; return null !== (n = null === (o = null === (i = this._layouts) || void 0 === i ? void 0 : i[e]) || void 0 === o ? void 0 : o.findIndex((function(e) { return e._id === t._id }))) && void 0 !== n ? n : -1 }, t.prototype.cleanupNode = function(t) { for (var e in t) "_" === e[0] && "_id" !== e && delete t[e]; return this }, t._idSeq = 0, t
                    }()
                },
                324: function(t, e, i) {
                    var o = this && this.__assign || function() {
                            return o = Object.assign || function(t) {
                                for (var e, i = 1, o = arguments.length; i < o; i++)
                                    for (var n in e = arguments[i]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                                return t
                            }, o.apply(this, arguments)
                        },
                        n = this && this.__createBinding || (Object.create ? function(t, e, i, o) {
                            void 0 === o && (o = i);
                            var n = Object.getOwnPropertyDescriptor(e, i);
                            n && !("get" in n ? !e.__esModule : n.writable || n.configurable) || (n = { enumerable: !0, get: function() { return e[i] } }), Object.defineProperty(t, o, n)
                        } : function(t, e, i, o) { void 0 === o && (o = i), t[o] = e[i] }),
                        r = this && this.__exportStar || function(t, e) { for (var i in t) "default" === i || Object.prototype.hasOwnProperty.call(e, i) || n(e, t, i) },
                        s = this && this.__spreadArray || function(t, e, i) {
                            if (i || 2 === arguments.length)
                                for (var o, n = 0, r = e.length; n < r; n++) !o && n in e || (o || (o = Array.prototype.slice.call(e, 0, n)), o[n] = e[n]);
                            return t.concat(o || Array.prototype.slice.call(e))
                        };
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.GridStack = void 0;
                    var a = i(506),
                        l = i(867),
                        d = i(855),
                        h = i(502),
                        u = i(537),
                        p = i(839),
                        c = new h.DDGridStack;
                    r(i(855), e), r(i(867), e), r(i(506), e), r(i(502), e), e.GridStack = function() {
                        function t(e, i) {
                            void 0 === i && (i = {});
                            var n, r, s = this;
                            this._gsEventHandler = {}, this._extraDragRow = 0, this.el = e, i = i || {}, e.classList.contains("grid-stack") || this.el.classList.add("grid-stack"), i.row && (i.minRow = i.maxRow = i.row, delete i.row);
                            var h = l.Utils.toNumber(e.getAttribute("gs-row"));
                            "auto" === i.column && delete i.column, void 0 !== i.alwaysShowResizeHandle && (i._alwaysShowResizeHandle = i.alwaysShowResizeHandle);
                            var c = o(o({}, l.Utils.cloneDeep(d.gridDefaults)), { column: l.Utils.toNumber(e.getAttribute("gs-column")) || d.gridDefaults.column, minRow: h || l.Utils.toNumber(e.getAttribute("gs-min-row")) || d.gridDefaults.minRow, maxRow: h || l.Utils.toNumber(e.getAttribute("gs-max-row")) || d.gridDefaults.maxRow, staticGrid: l.Utils.toBool(e.getAttribute("gs-static")) || d.gridDefaults.staticGrid, draggable: { handle: (i.handleClass ? "." + i.handleClass : i.handle ? i.handle : "") || d.gridDefaults.draggable.handle }, removableOptions: { accept: i.itemClass || d.gridDefaults.removableOptions.accept, decline: d.gridDefaults.removableOptions.decline } });
                            e.getAttribute("gs-animate") && (c.animate = l.Utils.toBool(e.getAttribute("gs-animate"))), this.opts = l.Utils.defaults(i, c), i = null, this._initMargin(), 1 !== this.opts.column && !this.opts.disableOneColumnMode && this._widthOrContainer() <= this.opts.oneColumnSize && (this._prevColumn = this.getColumn(), this.opts.column = 1), "auto" === this.opts.rtl && (this.opts.rtl = "rtl" === e.style.direction), this.opts.rtl && this.el.classList.add("grid-stack-rtl");
                            var g = null === (n = l.Utils.closestUpByClass(this.el, d.gridDefaults.itemClass)) || void 0 === n ? void 0 : n.gridstackNode;
                            g && (g.subGrid = this, this.parentGridItem = g, this.el.classList.add("grid-stack-nested"), g.el.classList.add("grid-stack-sub-grid")), this._isAutoCellHeight = "auto" === this.opts.cellHeight, this._isAutoCellHeight || "initial" === this.opts.cellHeight ? this.cellHeight(void 0, !1) : ("number" == typeof this.opts.cellHeight && this.opts.cellHeightUnit && this.opts.cellHeightUnit !== d.gridDefaults.cellHeightUnit && (this.opts.cellHeight = this.opts.cellHeight + this.opts.cellHeightUnit, delete this.opts.cellHeightUnit), this.cellHeight(this.opts.cellHeight, !1)), "mobile" === this.opts.alwaysShowResizeHandle && (this.opts.alwaysShowResizeHandle = u.isTouch), this._styleSheetClass = "gs-id-" + a.GridStackEngine._idSeq++, this.el.classList.add(this._styleSheetClass), this._setStaticClass();
                            var m = this.opts.engineClass || t.engineClass || a.GridStackEngine;
                            if (this.engine = new m({
                                    column: this.getColumn(),
                                    float: this.opts.float,
                                    maxRow: this.opts.maxRow,
                                    onChange: function(t) {
                                        var e = 0;
                                        s.engine.nodes.forEach((function(t) { e = Math.max(e, t.y + t.h) })), t.forEach((function(t) {
                                            var e = t.el;
                                            e && (t._removeDOM ? (e && e.remove(), delete t._removeDOM) : s._writePosAttr(e, t))
                                        })), s._updateStyles(!1, e)
                                    }
                                }), this.opts.auto && (this.batchUpdate(), this.getGridItems().forEach((function(t) { return s._prepareElement(t) })), this.batchUpdate(!1)), this.opts.children) {
                                var v = this.opts.children;
                                delete this.opts.children, v.length && this.load(v)
                            }
                            this.setAnimation(this.opts.animate), this._updateStyles(), this.el.classList.add("gs-" + this.opts.column), this.opts.subGridDynamic && !p.DDManager.pauseDrag && (p.DDManager.pauseDrag = !0), void 0 !== (null === (r = this.opts.draggable) || void 0 === r ? void 0 : r.pause) && (p.DDManager.pauseDrag = this.opts.draggable.pause), this._setupRemoveDrop(), this._setupAcceptWidget(), this._updateWindowResizeEvent()
                        }
                        return t.init = function(e, i) { void 0 === e && (e = {}), void 0 === i && (i = ".grid-stack"); var o = t.getGridElement(i); return o ? (o.gridstack || (o.gridstack = new t(o, l.Utils.cloneDeep(e))), o.gridstack) : ("string" == typeof i ? console.error('GridStack.initAll() no grid was found with selector "' + i + '" - element missing or wrong selector ?\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.') : console.error("GridStack.init() no grid element was passed."), null) }, t.initAll = function(e, i) { void 0 === e && (e = {}), void 0 === i && (i = ".grid-stack"); var o = []; return t.getGridElements(i).forEach((function(i) { i.gridstack || (i.gridstack = new t(i, l.Utils.cloneDeep(e))), o.push(i.gridstack) })), 0 === o.length && console.error('GridStack.initAll() no grid was found with selector "' + i + '" - element missing or wrong selector ?\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.'), o }, t.addGrid = function(e, i) {
                            if (void 0 === i && (i = {}), !e) return null;
                            var n = e;
                            if (n.gridstack) { var r = n.gridstack; return i && (r.opts = o(o({}, r.opts), i)), void 0 !== i.children && r.load(i.children), r }
                            if (!e.classList.contains("grid-stack") || t.addRemoveCB)
                                if (t.addRemoveCB) n = t.addRemoveCB(e, i, !0, !0);
                                else {
                                    var s = document.implementation.createHTMLDocument("");
                                    s.body.innerHTML = '<div class="grid-stack '.concat(i.class || "", '"></div>'), n = s.body.children[0], e.appendChild(n)
                                }
                            return t.init(i, n)
                        }, t.registerEngine = function(e) { t.engineClass = e }, Object.defineProperty(t.prototype, "placeholder", {
                            get: function() {
                                if (!this._placeholder) {
                                    var t = document.createElement("div");
                                    t.className = "placeholder-content", this.opts.placeholderText && (t.innerHTML = this.opts.placeholderText), this._placeholder = document.createElement("div"), this._placeholder.classList.add(this.opts.placeholderClass, d.gridDefaults.itemClass, this.opts.itemClass), this.placeholder.appendChild(t)
                                }
                                return this._placeholder
                            },
                            enumerable: !1,
                            configurable: !0
                        }), t.prototype.addWidget = function(e, i) {
                            var o, n, r;
                            if ("string" == typeof e)(s = document.implementation.createHTMLDocument("")).body.innerHTML = e, o = s.body.children[0];
                            else if (0 === arguments.length || 1 === arguments.length && (void 0 !== (r = e).el || void 0 !== r.x || void 0 !== r.y || void 0 !== r.w || void 0 !== r.h || void 0 !== r.content))
                                if (null == (n = i = e) ? void 0 : n.el) o = n.el;
                                else if (t.addRemoveCB) o = t.addRemoveCB(this.el, i, !0, !1);
                            else {
                                var s, a = (null == i ? void 0 : i.content) || "";
                                (s = document.implementation.createHTMLDocument("")).body.innerHTML = '<div class="grid-stack-item '.concat(this.opts.itemClass || "", '"><div class="grid-stack-item-content">').concat(a, "</div></div>"), o = s.body.children[0]
                            } else o = e;
                            if (o) { if ((n = o.gridstackNode) && o.parentElement === this.el && this.engine.nodes.find((function(t) { return t._id === n._id }))) return o; var d = this._readAttr(o); return i = l.Utils.cloneDeep(i) || {}, l.Utils.defaults(i, d), n = this.engine.prepareNode(i), this._writeAttr(o, i), this._insertNotAppend ? this.el.prepend(o) : this.el.appendChild(o), this.makeWidget(o, i), o }
                        }, t.prototype.makeSubGrid = function(e, i, n, r) {
                            var s, a, d;
                            void 0 === r && (r = !0);
                            var h, u = e.gridstackNode;
                            if (u || (u = this.makeWidget(e).gridstackNode), null === (s = u.subGrid) || void 0 === s ? void 0 : s.el) return u.subGrid;
                            for (var p, c = this; c && !h;) h = null === (a = c.opts) || void 0 === a ? void 0 : a.subGridOpts, c = null === (d = c.parentGridItem) || void 0 === d ? void 0 : d.grid;
                            i = l.Utils.cloneDeep(o(o(o({}, h || {}), { children: void 0 }), i || u.subGridOpts)), u.subGridOpts = i, "auto" === i.column && (p = !0, i.column = Math.max(u.w || 1, (null == n ? void 0 : n.w) || 1), i.disableOneColumnMode = !0);
                            var g, m, v = u.el.querySelector(".grid-stack-item-content");
                            if (r) {
                                if (this._removeDD(u.el), m = o(o({}, u), { x: 0, y: 0 }), l.Utils.removeInternalForSave(m), delete m.subGridOpts, u.content && (m.content = u.content, delete u.content), t.addRemoveCB) g = t.addRemoveCB(this.el, m, !0, !1);
                                else {
                                    var f = document.implementation.createHTMLDocument("");
                                    f.body.innerHTML = '<div class="grid-stack-item"></div>', (g = f.body.children[0]).appendChild(v), f.body.innerHTML = '<div class="grid-stack-item-content"></div>', v = f.body.children[0], u.el.appendChild(v)
                                }
                                this._prepareDragDropByNode(u)
                            }
                            if (n) {
                                var y = p ? i.column : u.w,
                                    _ = u.h + n.h,
                                    b = u.el.style;
                                b.transition = "none", this.update(u.el, { w: y, h: _ }), setTimeout((function() { return b.transition = null }))
                            }
                            var w = u.subGrid = t.addGrid(v, i);
                            return (null == n ? void 0 : n._moving) && (w._isTemp = !0), p && (w._autoColumn = !0), r && w.addWidget(g, m), n && (n._moving ? window.setTimeout((function() { return l.Utils.simulateMouseEvent(n._event, "mouseenter", w.el) }), 0) : w.addWidget(u.el, u)), w
                        }, t.prototype.removeAsSubGrid = function(t) {
                            var e, i = this,
                                o = null === (e = this.parentGridItem) || void 0 === e ? void 0 : e.grid;
                            o && (o.batchUpdate(), o.removeWidget(this.parentGridItem.el, !0, !0), this.engine.nodes.forEach((function(t) { t.x += i.parentGridItem.x, t.y += i.parentGridItem.y, o.addWidget(t.el, t) })), o.batchUpdate(!1), this.parentGridItem && delete this.parentGridItem.subGrid, delete this.parentGridItem, t && window.setTimeout((function() { return l.Utils.simulateMouseEvent(t._event, "mouseenter", o.el) }), 0))
                        }, t.prototype.save = function(e, i, o) {
                            void 0 === e && (e = !0), void 0 === i && (i = !1), void 0 === o && (o = t.saveCB);
                            var n = this.engine.save(e, o);
                            if (n.forEach((function(t) {
                                    var n;
                                    if (e && t.el && !t.subGrid && !o) {
                                        var r = t.el.querySelector(".grid-stack-item-content");
                                        t.content = r ? r.innerHTML : void 0, t.content || delete t.content
                                    } else if (e || o || delete t.content, null === (n = t.subGrid) || void 0 === n ? void 0 : n.el) {
                                        var s = t.subGrid.save(e, i, o);
                                        t.subGridOpts = i ? s : { children: s }, delete t.subGrid
                                    }
                                    delete t.el
                                })), i) {
                                var r = l.Utils.cloneDeep(this.opts);
                                r.marginBottom === r.marginTop && r.marginRight === r.marginLeft && r.marginTop === r.marginRight && (r.margin = r.marginTop, delete r.marginTop, delete r.marginRight, delete r.marginBottom, delete r.marginLeft), r.rtl === ("rtl" === this.el.style.direction) && (r.rtl = "auto"), this._isAutoCellHeight && (r.cellHeight = "auto"), this._autoColumn && (r.column = "auto", delete r.disableOneColumnMode);
                                var s = r._alwaysShowResizeHandle;
                                return delete r._alwaysShowResizeHandle, void 0 !== s ? r.alwaysShowResizeHandle = s : delete r.alwaysShowResizeHandle, l.Utils.removeInternalAndSame(r, d.gridDefaults), r.children = n, r
                            }
                            return n
                        }, t.prototype.load = function(e, i) {
                            var o = this;
                            void 0 === i && (i = t.addRemoveCB || !0);
                            var n = e.some((function(t) { return void 0 !== t.x || void 0 !== t.y })),
                                r = n ? l.Utils.sort(e, -1, this._prevColumn || this.getColumn()) : e;
                            this._insertNotAppend = n, this._prevColumn && this._prevColumn !== this.opts.column && r.some((function(t) { return (t.x || 0) + t.w > o.opts.column })) && (this._ignoreLayoutsNodeChange = !0, this.engine.cacheLayout(r, this._prevColumn, !0));
                            var a = t.addRemoveCB;
                            "function" == typeof i && (t.addRemoveCB = i);
                            var d = [];
                            this.batchUpdate(), i && s([], this.engine.nodes, !0).forEach((function(e) { r.find((function(t) { return e.id === t.id })) || (t.addRemoveCB && t.addRemoveCB(o.el, e, !1, !1), d.push(e), o.removeWidget(e.el, !0, !1)) }));
                            var h = this.engine.nodes;
                            return this.engine.nodes = [], r.forEach((function(t) {
                                var e, n = void 0 !== t.id ? h.find((function(e) { return e.id === t.id })) : void 0;
                                if (n) {
                                    if ((t.autoPosition || void 0 === t.x || void 0 === t.y) && (t.w = t.w || n.w, t.h = t.h || n.h, o.engine.findEmptyPosition(t)), o.engine.nodes.push(n), o.update(n.el, t), null === (e = t.subGridOpts) || void 0 === e ? void 0 : e.children) {
                                        var r = n.el.querySelector(".grid-stack");
                                        r && r.gridstack && (r.gridstack.load(t.subGridOpts.children), o._insertNotAppend = !0)
                                    }
                                } else i && o.addWidget(t)
                            })), this.engine.removedNodes = d, this.batchUpdate(!1), delete this._ignoreLayoutsNodeChange, delete this._insertNotAppend, a ? t.addRemoveCB = a : delete t.addRemoveCB, this
                        }, t.prototype.batchUpdate = function(t) { return void 0 === t && (t = !0), this.engine.batchUpdate(t), t || (this._triggerRemoveEvent(), this._triggerAddEvent(), this._triggerChangeEvent()), this }, t.prototype.getCellHeight = function(t) { if (void 0 === t && (t = !1), this.opts.cellHeight && "auto" !== this.opts.cellHeight && (!t || !this.opts.cellHeightUnit || "px" === this.opts.cellHeightUnit)) return this.opts.cellHeight; var e = this.el.querySelector("." + this.opts.itemClass); if (e) { var i = l.Utils.toNumber(e.getAttribute("gs-h")) || 1; return Math.round(e.offsetHeight / i) } var o = parseInt(this.el.getAttribute("gs-current-row")); return o ? Math.round(this.el.getBoundingClientRect().height / o) : this.opts.cellHeight }, t.prototype.cellHeight = function(t, e) {
                            if (void 0 === e && (e = !0), e && void 0 !== t && this._isAutoCellHeight !== ("auto" === t) && (this._isAutoCellHeight = "auto" === t, this._updateWindowResizeEvent()), "initial" !== t && "auto" !== t || (t = void 0), void 0 === t) {
                                var i = -this.opts.marginRight - this.opts.marginLeft + this.opts.marginTop + this.opts.marginBottom;
                                t = this.cellWidth() + i
                            }
                            var o = l.Utils.parseHeight(t);
                            return this.opts.cellHeightUnit === o.unit && this.opts.cellHeight === o.h || (this.opts.cellHeightUnit = o.unit, this.opts.cellHeight = o.h, e && this._updateStyles(!0)), this
                        }, t.prototype.cellWidth = function() { return this._widthOrContainer() / this.getColumn() }, t.prototype._widthOrContainer = function() { return this.el.clientWidth || this.el.parentElement.clientWidth || window.innerWidth }, t.prototype.compact = function(t, e) { return void 0 === t && (t = "compact"), void 0 === e && (e = !0), this.engine.compact(t, e), this._triggerChangeEvent(), this }, t.prototype.column = function(t, e) { if (void 0 === e && (e = "moveScale"), t < 1 || this.opts.column === t) return this; var i, o = this.getColumn(); return 1 === t ? this._prevColumn = o : delete this._prevColumn, this.el.classList.remove("gs-" + o), this.el.classList.add("gs-" + t), this.opts.column = this.engine.column = t, 1 === t && this.opts.oneColumnModeDomSort && (i = [], this.getGridItems().forEach((function(t) { t.gridstackNode && i.push(t.gridstackNode) })), i.length || (i = void 0)), this.engine.columnChanged(o, t, i, e), this._isAutoCellHeight && this.cellHeight(), this._ignoreLayoutsNodeChange = !0, this._triggerChangeEvent(), delete this._ignoreLayoutsNodeChange, this }, t.prototype.getColumn = function() { return this.opts.column }, t.prototype.getGridItems = function() { var t = this; return Array.from(this.el.children).filter((function(e) { return e.matches("." + t.opts.itemClass) && !e.matches("." + t.opts.placeholderClass) })) }, t.prototype.destroy = function(t) { if (void 0 === t && (t = !0), this.el) return this.offAll(), this._updateWindowResizeEvent(!0), this.setStatic(!0, !1), this.setAnimation(!1), t ? this.el.parentNode.removeChild(this.el) : (this.removeAll(t), this.el.classList.remove(this._styleSheetClass), this.el.removeAttribute("gs-current-row")), this._removeStylesheet(), this.parentGridItem && delete this.parentGridItem.subGrid, delete this.parentGridItem, delete this.opts, delete this._placeholder, delete this.engine, delete this.el.gridstack, delete this.el, this }, t.prototype.float = function(t) { return this.opts.float !== t && (this.opts.float = this.engine.float = t, this._triggerChangeEvent()), this }, t.prototype.getFloat = function() { return this.engine.float }, t.prototype.getCellFromPixel = function(t, e) {
                            void 0 === e && (e = !1);
                            var i, o = this.el.getBoundingClientRect();
                            i = e ? { top: o.top + document.documentElement.scrollTop, left: o.left } : { top: this.el.offsetTop, left: this.el.offsetLeft };
                            var n = t.left - i.left,
                                r = t.top - i.top,
                                s = o.width / this.getColumn(),
                                a = o.height / parseInt(this.el.getAttribute("gs-current-row"));
                            return { x: Math.floor(n / s), y: Math.floor(r / a) }
                        }, t.prototype.getRow = function() { return Math.max(this.engine.getRow(), this.opts.minRow) }, t.prototype.isAreaEmpty = function(t, e, i, o) { return this.engine.isAreaEmpty(t, e, i, o) }, t.prototype.makeWidget = function(e, i) {
                            var o = t.getElement(e);
                            this._prepareElement(o, !0, i), this._updateContainerHeight();
                            var n = o.gridstackNode;
                            return n.subGridOpts && this.makeSubGrid(o, n.subGridOpts, void 0, !1), this._prevColumn && 1 === this.opts.column && (this._ignoreLayoutsNodeChange = !0), this._triggerAddEvent(), this._triggerChangeEvent(), delete this._ignoreLayoutsNodeChange, o
                        }, t.prototype.on = function(t, e) {
                            var i = this;
                            if (-1 !== t.indexOf(" ")) return t.split(" ").forEach((function(t) { return i.on(t, e) })), this;
                            if ("change" === t || "added" === t || "removed" === t || "enable" === t || "disable" === t) {
                                var o = "enable" === t || "disable" === t;
                                this._gsEventHandler[t] = o ? function(t) { return e(t) } : function(t) { return e(t, t.detail) }, this.el.addEventListener(t, this._gsEventHandler[t])
                            } else "drag" === t || "dragstart" === t || "dragstop" === t || "resizestart" === t || "resize" === t || "resizestop" === t || "dropped" === t ? this._gsEventHandler[t] = e : console.log("GridStack.on(" + t + ') event not supported, but you can still use $(".grid-stack").on(...) while jquery-ui is still used internally.');
                            return this
                        }, t.prototype.off = function(t) { var e = this; return -1 !== t.indexOf(" ") ? (t.split(" ").forEach((function(t) { return e.off(t) })), this) : ("change" !== t && "added" !== t && "removed" !== t && "enable" !== t && "disable" !== t || this._gsEventHandler[t] && this.el.removeEventListener(t, this._gsEventHandler[t]), delete this._gsEventHandler[t], this) }, t.prototype.offAll = function() { var t = this; return Object.keys(this._gsEventHandler).forEach((function(e) { return t.off(e) })), this }, t.prototype.removeWidget = function(e, i, o) {
                            var n = this;
                            return void 0 === i && (i = !0), void 0 === o && (o = !0), t.getElements(e).forEach((function(e) {
                                if (!e.parentElement || e.parentElement === n.el) {
                                    var r = e.gridstackNode;
                                    r || (r = n.engine.nodes.find((function(t) { return e === t.el }))), r && (t.addRemoveCB && t.addRemoveCB(n.el, r, !1, !1), delete e.gridstackNode, n._removeDD(e), n.engine.removeNode(r, i, o), i && e.parentElement && e.remove())
                                }
                            })), o && (this._triggerRemoveEvent(), this._triggerChangeEvent()), this
                        }, t.prototype.removeAll = function(t) { var e = this; return void 0 === t && (t = !0), this.engine.nodes.forEach((function(t) { delete t.el.gridstackNode, e._removeDD(t.el) })), this.engine.removeAll(t), this._triggerRemoveEvent(), this }, t.prototype.setAnimation = function(t) { return t ? this.el.classList.add("grid-stack-animate") : this.el.classList.remove("grid-stack-animate"), this }, t.prototype.setStatic = function(t, e, i) { var o = this; return void 0 === e && (e = !0), void 0 === i && (i = !0), !!this.opts.staticGrid === t || (t ? this.opts.staticGrid = !0 : delete this.opts.staticGrid, this._setupRemoveDrop(), this._setupAcceptWidget(), this.engine.nodes.forEach((function(n) { o._prepareDragDropByNode(n), n.subGrid && i && n.subGrid.setStatic(t, e, i) })), e && this._setStaticClass()), this }, t.prototype.update = function(e, i) {
                            var o = this;
                            if (arguments.length > 2) {
                                console.warn("gridstack.ts: `update(el, x, y, w, h)` is deprecated. Use `update(el, {x, w, content, ...})`. It will be removed soon");
                                var n = arguments,
                                    r = 1;
                                return i = { x: n[r++], y: n[r++], w: n[r++], h: n[r++] }, this.update(e, i)
                            }
                            return t.getElements(e).forEach((function(t) {
                                var e, n = null == t ? void 0 : t.gridstackNode;
                                if (n) {
                                    var r = l.Utils.cloneDeep(i);
                                    delete r.autoPosition;
                                    var s, a = ["x", "y", "w", "h"];
                                    if (a.some((function(t) { return void 0 !== r[t] && r[t] !== n[t] })) && (s = {}, a.forEach((function(t) { s[t] = void 0 !== r[t] ? r[t] : n[t], delete r[t] }))), !s && (r.minW || r.minH || r.maxW || r.maxH) && (s = {}), void 0 !== r.content) {
                                        var d = t.querySelector(".grid-stack-item-content");
                                        if (!d || d.innerHTML === r.content) return;
                                        d.innerHTML = r.content, (null === (e = n.subGrid) || void 0 === e ? void 0 : e.el) && (d.appendChild(n.subGrid.el), n.subGrid.opts.styleInHead || n.subGrid._updateStyles(!0)), delete r.content
                                    }
                                    var h = !1,
                                        u = !1;
                                    for (var p in r) "_" !== p[0] && n[p] !== r[p] && (n[p] = r[p], h = !0, u = u || !o.opts.staticGrid && ("noResize" === p || "noMove" === p || "locked" === p));
                                    l.Utils.sanitizeMinMax(n), s && (o.engine.cleanNodes().beginUpdate(n).moveNode(n, s), o._updateContainerHeight(), o._triggerChangeEvent(), o.engine.endUpdate()), h && o._writeAttr(t, n), u && o._prepareDragDropByNode(n)
                                }
                            })), this
                        }, t.prototype.margin = function(t) { if (!("string" == typeof t && t.split(" ").length > 1)) { var e = l.Utils.parseHeight(t); if (this.opts.marginUnit === e.unit && this.opts.margin === e.h) return } return this.opts.margin = t, this.opts.marginTop = this.opts.marginBottom = this.opts.marginLeft = this.opts.marginRight = void 0, this._initMargin(), this._updateStyles(!0), this }, t.prototype.getMargin = function() { return this.opts.margin }, t.prototype.willItFit = function(t) {
                            if (arguments.length > 1) {
                                console.warn("gridstack.ts: `willItFit(x,y,w,h,autoPosition)` is deprecated. Use `willItFit({x, y,...})`. It will be removed soon");
                                var e = arguments,
                                    i = 0,
                                    o = { x: e[i++], y: e[i++], w: e[i++], h: e[i++], autoPosition: e[i++] };
                                return this.willItFit(o)
                            }
                            return this.engine.willItFit(t)
                        }, t.prototype._triggerChangeEvent = function() { if (this.engine.batchMode) return this; var t = this.engine.getDirtyNodes(!0); return t && t.length && (this._ignoreLayoutsNodeChange || this.engine.layoutsNodesChange(t), this._triggerEvent("change", t)), this.engine.saveInitial(), this }, t.prototype._triggerAddEvent = function() { var t; return this.engine.batchMode || (null === (t = this.engine.addedNodes) || void 0 === t ? void 0 : t.length) && (this._ignoreLayoutsNodeChange || this.engine.layoutsNodesChange(this.engine.addedNodes), this.engine.addedNodes.forEach((function(t) { delete t._dirty })), this._triggerEvent("added", this.engine.addedNodes), this.engine.addedNodes = []), this }, t.prototype._triggerRemoveEvent = function() { var t; return this.engine.batchMode || (null === (t = this.engine.removedNodes) || void 0 === t ? void 0 : t.length) && (this._triggerEvent("removed", this.engine.removedNodes), this.engine.removedNodes = []), this }, t.prototype._triggerEvent = function(t, e) { var i = e ? new CustomEvent(t, { bubbles: !1, detail: e }) : new Event(t); return this.el.dispatchEvent(i), this }, t.prototype._removeStylesheet = function() { return this._styles && (l.Utils.removeStylesheet(this._styleSheetClass), delete this._styles), this }, t.prototype._updateStyles = function(t, e) {
                            if (void 0 === t && (t = !1), t && this._removeStylesheet(), e || (e = this.getRow()), this._updateContainerHeight(), 0 === this.opts.cellHeight) return this;
                            var i = this.opts.cellHeight,
                                o = this.opts.cellHeightUnit,
                                n = ".".concat(this._styleSheetClass, " > .").concat(this.opts.itemClass);
                            if (!this._styles) {
                                var r = this.opts.styleInHead ? void 0 : this.el.parentNode;
                                if (this._styles = l.Utils.createStylesheet(this._styleSheetClass, r, { nonce: this.opts.nonce }), !this._styles) return this;
                                this._styles._max = 0, l.Utils.addCSSRule(this._styles, n, "height: ".concat(i).concat(o));
                                var s = this.opts.marginTop + this.opts.marginUnit,
                                    a = this.opts.marginBottom + this.opts.marginUnit,
                                    d = this.opts.marginRight + this.opts.marginUnit,
                                    h = this.opts.marginLeft + this.opts.marginUnit,
                                    u = "".concat(n, " > .grid-stack-item-content"),
                                    p = ".".concat(this._styleSheetClass, " > .grid-stack-placeholder > .placeholder-content");
                                l.Utils.addCSSRule(this._styles, u, "top: ".concat(s, "; right: ").concat(d, "; bottom: ").concat(a, "; left: ").concat(h, ";")), l.Utils.addCSSRule(this._styles, p, "top: ".concat(s, "; right: ").concat(d, "; bottom: ").concat(a, "; left: ").concat(h, ";")), l.Utils.addCSSRule(this._styles, "".concat(n, " > .ui-resizable-ne"), "right: ".concat(d)), l.Utils.addCSSRule(this._styles, "".concat(n, " > .ui-resizable-e"), "right: ".concat(d)), l.Utils.addCSSRule(this._styles, "".concat(n, " > .ui-resizable-se"), "right: ".concat(d, "; bottom: ").concat(a)), l.Utils.addCSSRule(this._styles, "".concat(n, " > .ui-resizable-nw"), "left: ".concat(h)), l.Utils.addCSSRule(this._styles, "".concat(n, " > .ui-resizable-w"), "left: ".concat(h)), l.Utils.addCSSRule(this._styles, "".concat(n, " > .ui-resizable-sw"), "left: ".concat(h, "; bottom: ").concat(a))
                            }
                            if ((e = e || this._styles._max) > this._styles._max) {
                                for (var c = function(t) { return i * t + o }, g = this._styles._max + 1; g <= e; g++) l.Utils.addCSSRule(this._styles, "".concat(n, '[gs-y="').concat(g, '"]'), "top: ".concat(c(g))), l.Utils.addCSSRule(this._styles, "".concat(n, '[gs-h="').concat(g + 1, '"]'), "height: ".concat(c(g + 1)));
                                this._styles._max = e
                            }
                            return this
                        }, t.prototype._updateContainerHeight = function() {
                            if (!this.engine || this.engine.batchMode) return this;
                            var t = this.getRow() + this._extraDragRow;
                            if (this.el.setAttribute("gs-current-row", String(t)), 0 === t) return this.el.style.removeProperty("min-height"), this;
                            var e = this.opts.cellHeight,
                                i = this.opts.cellHeightUnit;
                            return e ? (this.el.style.minHeight = t * e + i, this) : this
                        }, t.prototype._prepareElement = function(t, e, i) { void 0 === e && (e = !1), t.classList.add(this.opts.itemClass), i = i || this._readAttr(t), t.gridstackNode = i, i.el = t, i.grid = this; var n = o({}, i); return i = this.engine.addNode(i, e), l.Utils.same(i, n) || this._writeAttr(t, i), this._prepareDragDropByNode(i), this }, t.prototype._writePosAttr = function(t, e) { return void 0 !== e.x && null !== e.x && t.setAttribute("gs-x", String(e.x)), void 0 !== e.y && null !== e.y && t.setAttribute("gs-y", String(e.y)), e.w > 1 ? t.setAttribute("gs-w", String(e.w)) : t.removeAttribute("gs-w"), e.h > 1 ? t.setAttribute("gs-h", String(e.h)) : t.removeAttribute("gs-h"), this }, t.prototype._writeAttr = function(t, e) {
                            if (!e) return this;
                            this._writePosAttr(t, e);
                            var i = { autoPosition: "gs-auto-position", noResize: "gs-no-resize", noMove: "gs-no-move", locked: "gs-locked", id: "gs-id" };
                            for (var o in i) e[o] ? t.setAttribute(i[o], String(e[o])) : t.removeAttribute(i[o]);
                            return this
                        }, t.prototype._readAttr = function(t, e) {
                            void 0 === e && (e = !0);
                            var i = {};
                            for (var o in i.x = l.Utils.toNumber(t.getAttribute("gs-x")), i.y = l.Utils.toNumber(t.getAttribute("gs-y")), i.w = l.Utils.toNumber(t.getAttribute("gs-w")), i.h = l.Utils.toNumber(t.getAttribute("gs-h")), i.autoPosition = l.Utils.toBool(t.getAttribute("gs-auto-position")), i.noResize = l.Utils.toBool(t.getAttribute("gs-no-resize")), i.noMove = l.Utils.toBool(t.getAttribute("gs-no-move")), i.locked = l.Utils.toBool(t.getAttribute("gs-locked")), i.id = t.getAttribute("gs-id"), i.maxW = l.Utils.toNumber(t.getAttribute("gs-max-w")), i.minW = l.Utils.toNumber(t.getAttribute("gs-min-w")), i.maxH = l.Utils.toNumber(t.getAttribute("gs-max-h")), i.minH = l.Utils.toNumber(t.getAttribute("gs-min-h")), e && (1 === i.w && t.removeAttribute("gs-w"), 1 === i.h && t.removeAttribute("gs-h"), i.maxW && t.removeAttribute("gs-max-w"), i.minW && t.removeAttribute("gs-min-w"), i.maxH && t.removeAttribute("gs-max-h"), i.minH && t.removeAttribute("gs-min-h")), i) {
                                if (!i.hasOwnProperty(o)) return;
                                i[o] || 0 === i[o] || delete i[o]
                            }
                            return i
                        }, t.prototype._setStaticClass = function() { var t, e, i = ["grid-stack-static"]; return this.opts.staticGrid ? ((t = this.el.classList).add.apply(t, i), this.el.setAttribute("gs-static", "true")) : ((e = this.el.classList).remove.apply(e, i), this.el.removeAttribute("gs-static")), this }, t.prototype.onParentResize = function() {
                            var t = this;
                            if (this.el && this.el.clientWidth) {
                                var e = !1;
                                if (this._autoColumn && this.parentGridItem) this.opts.column !== this.parentGridItem.w && (e = !0, this.column(this.parentGridItem.w, "none"));
                                else {
                                    var i = !this.opts.disableOneColumnMode && this.el.clientWidth <= this.opts.oneColumnSize;
                                    1 === this.opts.column !== i && (e = !0, this.opts.animate && this.setAnimation(!1), this.column(i ? 1 : this._prevColumn), this.opts.animate && this.setAnimation(!0))
                                }
                                return this._isAutoCellHeight && (!e && this.opts.cellHeightThrottle ? (this._cellHeightThrottle || (this._cellHeightThrottle = l.Utils.throttle((function() { return t.cellHeight() }), this.opts.cellHeightThrottle)), this._cellHeightThrottle()) : this.cellHeight()), this.engine.nodes.forEach((function(t) { t.subGrid && t.subGrid.onParentResize() })), this
                            }
                        }, t.prototype._updateWindowResizeEvent = function(t) { void 0 === t && (t = !1); var e = (this._isAutoCellHeight || !this.opts.disableOneColumnMode) && !this.parentGridItem; return t || !e || this._windowResizeBind ? !t && e || !this._windowResizeBind || (window.removeEventListener("resize", this._windowResizeBind), delete this._windowResizeBind) : (this._windowResizeBind = this.onParentResize.bind(this), window.addEventListener("resize", this._windowResizeBind)), this }, t.getElement = function(t) { return void 0 === t && (t = ".grid-stack-item"), l.Utils.getElement(t) }, t.getElements = function(t) { return void 0 === t && (t = ".grid-stack-item"), l.Utils.getElements(t) }, t.getGridElement = function(e) { return t.getElement(e) }, t.getGridElements = function(t) { return l.Utils.getElements(t) }, t.prototype._initMargin = function() {
                            var t, e = 0,
                                i = [];
                            return "string" == typeof this.opts.margin && (i = this.opts.margin.split(" ")), 2 === i.length ? (this.opts.marginTop = this.opts.marginBottom = i[0], this.opts.marginLeft = this.opts.marginRight = i[1]) : 4 === i.length ? (this.opts.marginTop = i[0], this.opts.marginRight = i[1], this.opts.marginBottom = i[2], this.opts.marginLeft = i[3]) : (t = l.Utils.parseHeight(this.opts.margin), this.opts.marginUnit = t.unit, e = this.opts.margin = t.h), void 0 === this.opts.marginTop ? this.opts.marginTop = e : (t = l.Utils.parseHeight(this.opts.marginTop), this.opts.marginTop = t.h, delete this.opts.margin), void 0 === this.opts.marginBottom ? this.opts.marginBottom = e : (t = l.Utils.parseHeight(this.opts.marginBottom), this.opts.marginBottom = t.h, delete this.opts.margin), void 0 === this.opts.marginRight ? this.opts.marginRight = e : (t = l.Utils.parseHeight(this.opts.marginRight), this.opts.marginRight = t.h, delete this.opts.margin), void 0 === this.opts.marginLeft ? this.opts.marginLeft = e : (t = l.Utils.parseHeight(this.opts.marginLeft), this.opts.marginLeft = t.h, delete this.opts.margin), this.opts.marginUnit = t.unit, this.opts.marginTop === this.opts.marginBottom && this.opts.marginLeft === this.opts.marginRight && this.opts.marginTop === this.opts.marginRight && (this.opts.margin = this.opts.marginTop), this
                        }, t.getDD = function() { return c }, t.setupDragIn = function(t, e, i) {
                            void 0 === i && (i = document), void 0 !== (null == e ? void 0 : e.pause) && (p.DDManager.pauseDrag = e.pause), e = o(o({}, d.dragInDefaultOptions), e || {});
                            var n = "string" == typeof t ? l.Utils.getElements(t, i) : t;
                            n.length && (null == n || n.forEach((function(t) { c.isDraggable(t) || c.dragIn(t, e) })))
                        }, t.prototype.movable = function(e, i) {
                            var o = this;
                            return this.opts.staticGrid || t.getElements(e).forEach((function(t) {
                                var e = t.gridstackNode;
                                e && (i ? delete e.noMove : e.noMove = !0, o._prepareDragDropByNode(e))
                            })), this
                        }, t.prototype.resizable = function(e, i) {
                            var o = this;
                            return this.opts.staticGrid || t.getElements(e).forEach((function(t) {
                                var e = t.gridstackNode;
                                e && (i ? delete e.noResize : e.noResize = !0, o._prepareDragDropByNode(e))
                            })), this
                        }, t.prototype.disable = function(t) { if (void 0 === t && (t = !0), !this.opts.staticGrid) return this.enableMove(!1, t), this.enableResize(!1, t), this._triggerEvent("disable"), this }, t.prototype.enable = function(t) { if (void 0 === t && (t = !0), !this.opts.staticGrid) return this.enableMove(!0, t), this.enableResize(!0, t), this._triggerEvent("enable"), this }, t.prototype.enableMove = function(t, e) { var i = this; return void 0 === e && (e = !0), this.opts.staticGrid || (t ? delete this.opts.disableDrag : this.opts.disableDrag = !0, this.engine.nodes.forEach((function(o) { i._prepareDragDropByNode(o), o.subGrid && e && o.subGrid.enableMove(t, e) }))), this }, t.prototype.enableResize = function(t, e) { var i = this; return void 0 === e && (e = !0), this.opts.staticGrid || (t ? delete this.opts.disableResize : this.opts.disableResize = !0, this.engine.nodes.forEach((function(o) { i._prepareDragDropByNode(o), o.subGrid && e && o.subGrid.enableResize(t, e) }))), this }, t.prototype._removeDD = function(t) { return c.draggable(t, "destroy").resizable(t, "destroy"), t.gridstackNode && delete t.gridstackNode._initDD, delete t.ddElement, this }, t.prototype._setupAcceptWidget = function() {
                            var t, e, i = this;
                            if (this.opts.staticGrid || !this.opts.acceptWidgets && !this.opts.removable) return c.droppable(this.el, "destroy"), this;
                            var n = function(o, n, r) {
                                var s, a = n.gridstackNode;
                                if (a) {
                                    r = r || n;
                                    var d = i.el.getBoundingClientRect(),
                                        h = (s = r.getBoundingClientRect()).top,
                                        u = s.left;
                                    u -= d.left;
                                    var p = { position: { top: h -= d.top, left: u } };
                                    if (a._temporaryRemoved) {
                                        if (a.x = Math.max(0, Math.round(u / e)), a.y = Math.max(0, Math.round(h / t)), delete a.autoPosition, i.engine.nodeBoundFix(a), !i.engine.willItFit(a)) {
                                            if (a.autoPosition = !0, !i.engine.willItFit(a)) return void c.off(n, "drag");
                                            a._willFitPos && (l.Utils.copyPos(a, a._willFitPos), delete a._willFitPos)
                                        }
                                        i._onStartMoving(r, o, p, a, e, t)
                                    } else i._dragOrResize(r, o, p, a, e, t)
                                }
                            };
                            return c.droppable(this.el, {
                                accept: function(t) {
                                    var e = t.gridstackNode;
                                    if ((null == e ? void 0 : e.grid) === i) return !0;
                                    if (!i.opts.acceptWidgets) return !1;
                                    var o = !0;
                                    if ("function" == typeof i.opts.acceptWidgets) o = i.opts.acceptWidgets(t);
                                    else {
                                        var n = !0 === i.opts.acceptWidgets ? ".grid-stack-item" : i.opts.acceptWidgets;
                                        o = t.matches(n)
                                    }
                                    if (o && e && i.opts.maxRow) {
                                        var r = { w: e.w, h: e.h, minW: e.minW, minH: e.minH };
                                        o = i.engine.willItFit(r)
                                    }
                                    return o
                                }
                            }).on(this.el, "dropover", (function(r, s, a) {
                                var l = s.gridstackNode;
                                if ((null == l ? void 0 : l.grid) === i && !l._temporaryRemoved) return !1;
                                (null == l ? void 0 : l.grid) && l.grid !== i && !l._temporaryRemoved && l.grid._leave(s, a), e = i.cellWidth(), t = i.getCellHeight(!0), l || (l = i._readAttr(s, !1)), l.grid || (l._isExternal = !0, s.gridstackNode = l), a = a || s;
                                var d = l.w || Math.round(a.offsetWidth / e) || 1,
                                    h = l.h || Math.round(a.offsetHeight / t) || 1;
                                return l.grid && l.grid !== i ? (s._gridstackNodeOrig || (s._gridstackNodeOrig = l), s.gridstackNode = l = o(o({}, l), { w: d, h: h, grid: i }), i.engine.cleanupNode(l).nodeBoundFix(l), l._initDD = l._isExternal = l._temporaryRemoved = !0) : (l.w = d, l.h = h, l._temporaryRemoved = !0), i._itemRemoving(l.el, !1), c.on(s, "drag", n), n(r, s, a), !1
                            })).on(this.el, "dropout", (function(t, e, o) { var n = e.gridstackNode; return !!n && (n.grid && n.grid !== i || (i._leave(e, o), i._isTemp && i.removeAsSubGrid(n)), !1) })).on(this.el, "drop", (function(t, e, n) {
                                var r, s, a = e.gridstackNode;
                                if ((null == a ? void 0 : a.grid) === i && !a._isExternal) return !1;
                                var h = !!i.placeholder.parentElement;
                                i.placeholder.remove();
                                var u = e._gridstackNodeOrig;
                                if (delete e._gridstackNodeOrig, h && (null == u ? void 0 : u.grid) && u.grid !== i) {
                                    var p = u.grid;
                                    p.engine.removedNodes.push(u), p._triggerRemoveEvent()._triggerChangeEvent(), p.parentGridItem && !p.engine.nodes.length && p.opts.subGridDynamic && p.removeAsSubGrid()
                                }
                                if (!a) return !1;
                                if (h && (i.engine.cleanupNode(a), a.grid = i), c.off(e, "drag"), n !== e ? (n.remove(), e.gridstackNode = u, h && (e = e.cloneNode(!0))) : (e.remove(), i._removeDD(e)), !h) return !1;
                                e.gridstackNode = a, a.el = e;
                                var g = null === (s = null === (r = a.subGrid) || void 0 === r ? void 0 : r.el) || void 0 === s ? void 0 : s.gridstack;
                                return l.Utils.copyPos(a, i._readAttr(i.placeholder)), l.Utils.removePositioningStyles(e), i._writeAttr(e, a), e.classList.add(d.gridDefaults.itemClass, i.opts.itemClass), i.el.appendChild(e), g && (g.parentGridItem = a, g.opts.styleInHead || g._updateStyles(!0)), i._updateContainerHeight(), i.engine.addedNodes.push(a), i._triggerAddEvent(), i._triggerChangeEvent(), i.engine.endUpdate(), i._gsEventHandler.dropped && i._gsEventHandler.dropped(o(o({}, t), { type: "dropped" }), u && u.grid ? u : void 0, a), window.setTimeout((function() { a.el && a.el.parentElement ? i._prepareDragDropByNode(a) : i.engine.removeNode(a), delete a.grid._isTemp })), !1
                            })), this
                        }, t.prototype._itemRemoving = function(t, e) {
                            var i = t ? t.gridstackNode : void 0;
                            i && i.grid && !t.classList.contains(this.opts.removableOptions.decline) && (e ? i._isAboutToRemove = !0 : delete i._isAboutToRemove, e ? t.classList.add("grid-stack-item-removing") : t.classList.remove("grid-stack-item-removing"))
                        }, t.prototype._setupRemoveDrop = function() {
                            var t = this;
                            if (!this.opts.staticGrid && "string" == typeof this.opts.removable) {
                                var e = document.querySelector(this.opts.removable);
                                if (!e) return this;
                                c.isDroppable(e) || c.droppable(e, this.opts.removableOptions).on(e, "dropover", (function(e, i) { return t._itemRemoving(i, !0) })).on(e, "dropout", (function(e, i) { return t._itemRemoving(i, !1) }))
                            }
                            return this
                        }, t.prototype._prepareDragDropByNode = function(t) {
                            var e = this,
                                i = t.el,
                                o = t.noMove || this.opts.disableDrag,
                                n = t.noResize || this.opts.disableResize;
                            if (this.opts.staticGrid || o && n) return t._initDD && (this._removeDD(i), delete t._initDD), i.classList.add("ui-draggable-disabled", "ui-resizable-disabled"), this;
                            if (!t._initDD) {
                                var r, s, a = function(o, n) { e._gsEventHandler[o.type] && e._gsEventHandler[o.type](o, o.target), r = e.cellWidth(), s = e.getCellHeight(!0), e._onStartMoving(i, o, n, t, r, s) },
                                    d = function(o, n) { e._dragOrResize(i, o, n, t, r, s) },
                                    h = function(o) {
                                        e.placeholder.remove(), delete t._moving, delete t._event, delete t._lastTried;
                                        var n = o.target;
                                        if (n.gridstackNode && n.gridstackNode.grid === e) {
                                            if (t.el = n, t._isAboutToRemove) {
                                                var r = i.gridstackNode.grid;
                                                r._gsEventHandler[o.type] && r._gsEventHandler[o.type](o, n), r.engine.nodes.push(t), r.removeWidget(i, !0, !0)
                                            } else l.Utils.removePositioningStyles(n), t._temporaryRemoved ? (l.Utils.copyPos(t, t._orig), e._writePosAttr(n, t), e.engine.addNode(t)) : e._writePosAttr(n, t), e._gsEventHandler[o.type] && e._gsEventHandler[o.type](o, n);
                                            e._extraDragRow = 0, e._updateContainerHeight(), e._triggerChangeEvent(), e.engine.endUpdate()
                                        }
                                    };
                                c.draggable(i, { start: a, stop: h, drag: d }).resizable(i, { start: a, stop: h, resize: d }), t._initDD = !0
                            }
                            return c.draggable(i, o ? "disable" : "enable").resizable(i, n ? "disable" : "enable"), this
                        }, t.prototype._onStartMoving = function(t, e, i, o, n, r) { this.engine.cleanNodes().beginUpdate(o), this._writePosAttr(this.placeholder, o), this.el.appendChild(this.placeholder), o.el = this.placeholder, o._lastUiPosition = i.position, o._prevYPix = i.position.top, o._moving = "dragstart" === e.type, delete o._lastTried, "dropover" === e.type && o._temporaryRemoved && (this.engine.addNode(o), o._moving = !0), this.engine.cacheRects(n, r, this.opts.marginTop, this.opts.marginRight, this.opts.marginBottom, this.opts.marginLeft), "resizestart" === e.type && (c.resizable(t, "option", "minWidth", n * (o.minW || 1)).resizable(t, "option", "minHeight", r * (o.minH || 1)), o.maxW && c.resizable(t, "option", "maxWidth", n * o.maxW), o.maxH && c.resizable(t, "option", "maxHeight", r * o.maxH)) }, t.prototype._dragOrResize = function(t, e, i, n, r, s) {
                            var a, d = o({}, n._orig),
                                h = this.opts.marginLeft,
                                u = this.opts.marginRight,
                                p = this.opts.marginTop,
                                c = this.opts.marginBottom,
                                g = Math.round(.1 * s),
                                m = Math.round(.1 * r);
                            if (h = Math.min(h, m), u = Math.min(u, m), p = Math.min(p, g), c = Math.min(c, g), "drag" === e.type) {
                                if (n._temporaryRemoved) return;
                                var v = i.position.top - n._prevYPix;
                                n._prevYPix = i.position.top, !1 !== this.opts.draggable.scroll && l.Utils.updateScrollPosition(t, i.position, v);
                                var f = i.position.left + (i.position.left > n._lastUiPosition.left ? -u : h),
                                    y = i.position.top + (i.position.top > n._lastUiPosition.top ? -c : p);
                                d.x = Math.round(f / r), d.y = Math.round(y / s);
                                var _ = this._extraDragRow;
                                if (this.engine.collide(n, d)) {
                                    var b = this.getRow(),
                                        w = Math.max(0, d.y + n.h - b);
                                    this.opts.maxRow && b + w > this.opts.maxRow && (w = Math.max(0, this.opts.maxRow - b)), this._extraDragRow = w
                                } else this._extraDragRow = 0;
                                if (this._extraDragRow !== _ && this._updateContainerHeight(), n.x === d.x && n.y === d.y) return
                            } else if ("resize" === e.type) {
                                if (d.x < 0) return;
                                if (l.Utils.updateScrollResize(e, t, s), d.w = Math.round((i.size.width - h) / r), d.h = Math.round((i.size.height - p) / s), n.w === d.w && n.h === d.h) return;
                                if (n._lastTried && n._lastTried.w === d.w && n._lastTried.h === d.h) return;
                                f = i.position.left + h;
                                var E = i.position.top + p;
                                d.x = Math.round(f / r), d.y = Math.round(E / s), a = !0
                            }
                            n._event = e, n._lastTried = d;
                            var D = { x: i.position.left + h, y: i.position.top + p, w: (i.size ? i.size.width : n.w * r) - h - u, h: (i.size ? i.size.height : n.h * s) - p - c };
                            if (this.engine.moveNodeCheck(n, o(o({}, d), { cellWidth: r, cellHeight: s, rect: D, resizing: a }))) {
                                n._lastUiPosition = i.position, this.engine.cacheRects(r, s, p, u, c, h), delete n._skipDown, a && n.subGrid && n.subGrid.onParentResize(), this._extraDragRow = 0, this._updateContainerHeight();
                                var x = e.target;
                                this._writePosAttr(x, n), this._gsEventHandler[e.type] && this._gsEventHandler[e.type](e, x)
                            }
                        }, t.prototype._leave = function(t, e) {
                            var i = t.gridstackNode;
                            i && (c.off(t, "drag"), i._temporaryRemoved || (i._temporaryRemoved = !0, this.engine.removeNode(i), i.el = i._isExternal && e ? e : t, !0 === this.opts.removable && this._itemRemoving(t, !0), t._gridstackNodeOrig ? (t.gridstackNode = t._gridstackNodeOrig, delete t._gridstackNodeOrig) : i._isExternal && (delete i.el, delete t.gridstackNode, this.engine.restoreInitial())))
                        }, t.prototype.commit = function() { return (0, l.obsolete)(this, this.batchUpdate(!1), "commit", "batchUpdate", "5.2"), this }, t.Utils = l.Utils, t.Engine = a.GridStackEngine, t.GDRev = "8.4.0", t
                    }()
                },
                855: function(t, e) { Object.defineProperty(e, "__esModule", { value: !0 }), e.dragInDefaultOptions = e.gridDefaults = void 0, e.gridDefaults = { alwaysShowResizeHandle: "mobile", animate: !0, auto: !0, cellHeight: "auto", cellHeightThrottle: 100, cellHeightUnit: "px", column: 12, draggable: { handle: ".grid-stack-item-content", appendTo: "body", scroll: !0 }, handle: ".grid-stack-item-content", itemClass: "grid-stack-item", margin: 10, marginUnit: "px", maxRow: 0, minRow: 0, oneColumnSize: 768, placeholderClass: "grid-stack-placeholder", placeholderText: "", removableOptions: { accept: "grid-stack-item", decline: "grid-stack-non-removable" }, resizable: { handles: "se" }, rtl: "auto" }, e.dragInDefaultOptions = { handle: ".grid-stack-item-content", appendTo: "body" } },
                867: function(t, e) {
                    var i = this && this.__assign || function() {
                            return i = Object.assign || function(t) {
                                for (var e, i = 1, o = arguments.length; i < o; i++)
                                    for (var n in e = arguments[i]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                                return t
                            }, i.apply(this, arguments)
                        },
                        o = this && this.__spreadArray || function(t, e, i) {
                            if (i || 2 === arguments.length)
                                for (var o, n = 0, r = e.length; n < r; n++) !o && n in e || (o || (o = Array.prototype.slice.call(e, 0, n)), o[n] = e[n]);
                            return t.concat(o || Array.prototype.slice.call(e))
                        };
                    Object.defineProperty(e, "__esModule", { value: !0 }), e.Utils = e.obsoleteAttr = e.obsoleteOptsDel = e.obsoleteOpts = e.obsolete = void 0, e.obsolete = function(t, e, i, o, n) { var r = function() { for (var r = [], s = 0; s < arguments.length; s++) r[s] = arguments[s]; return console.warn("gridstack.js: Function `" + i + "` is deprecated in " + n + " and has been replaced with `" + o + "`. It will be **removed** in a future release"), e.apply(t, r) }; return r.prototype = e.prototype, r }, e.obsoleteOpts = function(t, e, i, o) { void 0 !== t[e] && (t[i] = t[e], console.warn("gridstack.js: Option `" + e + "` is deprecated in " + o + " and has been replaced with `" + i + "`. It will be **removed** in a future release")) }, e.obsoleteOptsDel = function(t, e, i, o) { void 0 !== t[e] && console.warn("gridstack.js: Option `" + e + "` is deprecated in " + i + o) }, e.obsoleteAttr = function(t, e, i, o) {
                        var n = t.getAttribute(e);
                        null !== n && (t.setAttribute(i, n), console.warn("gridstack.js: attribute `" + e + "`=" + n + " is deprecated on this object in " + o + " and has been replaced with `" + i + "`. It will be **removed** in a future release"))
                    };
                    var n = function() {
                        function t() {}
                        return t.getElements = function(t, e) { if (void 0 === e && (e = document), "string" == typeof t) { var i = "getElementById" in e ? e : void 0; if (i && !isNaN(+t[0])) { var o = i.getElementById(t); return o ? [o] : [] } var n = e.querySelectorAll(t); return n.length || "." === t[0] || "#" === t[0] || (n = e.querySelectorAll("." + t)).length || (n = e.querySelectorAll("#" + t)), Array.from(n) } return [t] }, t.getElement = function(t, e) { if (void 0 === e && (e = document), "string" == typeof t) { var i = "getElementById" in e ? e : void 0; if (!t.length) return null; if (i && "#" === t[0]) return i.getElementById(t.substring(1)); if ("#" === t[0] || "." === t[0] || "[" === t[0]) return e.querySelector(t); if (i && !isNaN(+t[0])) return i.getElementById(t); var o = e.querySelector(t); return i && !o && (o = i.getElementById(t)), o || (o = e.querySelector("." + t)), o } return t }, t.isIntercepted = function(t, e) { return !(t.y >= e.y + e.h || t.y + t.h <= e.y || t.x + t.w <= e.x || t.x >= e.x + e.w) }, t.isTouching = function(e, i) { return t.isIntercepted(e, { x: i.x - .5, y: i.y - .5, w: i.w + 1, h: i.h + 1 }) }, t.areaIntercept = function(t, e) {
                            var i = t.x > e.x ? t.x : e.x,
                                o = t.x + t.w < e.x + e.w ? t.x + t.w : e.x + e.w;
                            if (o <= i) return 0;
                            var n = t.y > e.y ? t.y : e.y,
                                r = t.y + t.h < e.y + e.h ? t.y + t.h : e.y + e.h;
                            return r <= n ? 0 : (o - i) * (r - n)
                        }, t.area = function(t) { return t.w * t.h }, t.sort = function(t, e, i) { return void 0 === e && (e = 1), i = i || t.reduce((function(t, e) { return Math.max(e.x + e.w, t) }), 0) || 12, -1 === e ? t.sort((function(t, e) { var o, n, r, s; return (null !== (o = e.x) && void 0 !== o ? o : 1e3) + (null !== (n = e.y) && void 0 !== n ? n : 1e3) * i - ((null !== (r = t.x) && void 0 !== r ? r : 1e3) + (null !== (s = t.y) && void 0 !== s ? s : 1e3) * i) })) : t.sort((function(t, e) { var o, n, r, s; return (null !== (o = t.x) && void 0 !== o ? o : 1e3) + (null !== (n = t.y) && void 0 !== n ? n : 1e3) * i - ((null !== (r = e.x) && void 0 !== r ? r : 1e3) + (null !== (s = e.y) && void 0 !== s ? s : 1e3) * i) })) }, t.createStylesheet = function(t, e, i) {
                            var o = document.createElement("style"),
                                n = null == i ? void 0 : i.nonce;
                            return n && (o.nonce = n), o.setAttribute("type", "text/css"), o.setAttribute("gs-style-id", t), o.styleSheet ? o.styleSheet.cssText = "" : o.appendChild(document.createTextNode("")), e ? e.insertBefore(o, e.firstChild) : (e = document.getElementsByTagName("head")[0]).appendChild(o), o.sheet
                        }, t.removeStylesheet = function(t) {
                            var e = document.querySelector("STYLE[gs-style-id=" + t + "]");
                            e && e.parentNode && e.remove()
                        }, t.addCSSRule = function(t, e, i) { "function" == typeof t.addRule ? t.addRule(e, i) : "function" == typeof t.insertRule && t.insertRule("".concat(e, "{").concat(i, "}")) }, t.toBool = function(t) { return "boolean" == typeof t ? t : "string" == typeof t ? !("" === (t = t.toLowerCase()) || "no" === t || "false" === t || "0" === t) : Boolean(t) }, t.toNumber = function(t) { return null === t || 0 === t.length ? void 0 : Number(t) }, t.parseHeight = function(t) {
                            var e, i = "px";
                            if ("string" == typeof t) {
                                var o = t.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%)?$/);
                                if (!o) throw new Error("Invalid height");
                                i = o[2] || "px", e = parseFloat(o[1])
                            } else e = t;
                            return { h: e, unit: i }
                        }, t.defaults = function(t) {
                            for (var e = this, i = [], o = 1; o < arguments.length; o++) i[o - 1] = arguments[o];
                            return i.forEach((function(i) {
                                for (var o in i) {
                                    if (!i.hasOwnProperty(o)) return;
                                    null === t[o] || void 0 === t[o] ? t[o] = i[o] : "object" == typeof i[o] && "object" == typeof t[o] && e.defaults(t[o], i[o])
                                }
                            })), t
                        }, t.same = function(t, e) {
                            if ("object" != typeof t) return t == e;
                            if (typeof t != typeof e) return !1;
                            if (Object.keys(t).length !== Object.keys(e).length) return !1;
                            for (var i in t)
                                if (t[i] !== e[i]) return !1;
                            return !0
                        }, t.copyPos = function(t, e, i) { return void 0 === i && (i = !1), void 0 !== e.x && (t.x = e.x), void 0 !== e.y && (t.y = e.y), void 0 !== e.w && (t.w = e.w), void 0 !== e.h && (t.h = e.h), i && (e.minW && (t.minW = e.minW), e.minH && (t.minH = e.minH), e.maxW && (t.maxW = e.maxW), e.maxH && (t.maxH = e.maxH)), t }, t.samePos = function(t, e) { return t && e && t.x === e.x && t.y === e.y && t.w === e.w && t.h === e.h }, t.sanitizeMinMax = function(t) { t.minW || delete t.minW, t.minH || delete t.minH, t.maxW || delete t.maxW, t.maxH || delete t.maxH }, t.removeInternalAndSame = function(t, e) {
                            if ("object" == typeof t && "object" == typeof e)
                                for (var i in t) {
                                    var o = t[i];
                                    if ("_" === i[0] || o === e[i]) delete t[i];
                                    else if (o && "object" == typeof o && void 0 !== e[i]) {
                                        for (var n in o) o[n] !== e[i][n] && "_" !== n[0] || delete o[n];
                                        Object.keys(o).length || delete t[i]
                                    }
                                }
                        }, t.removeInternalForSave = function(t, e) {
                            for (var i in void 0 === e && (e = !0), t) "_" !== i[0] && null !== t[i] && void 0 !== t[i] || delete t[i];
                            delete t.grid, e && delete t.el, t.autoPosition || delete t.autoPosition, t.noResize || delete t.noResize, t.noMove || delete t.noMove, t.locked || delete t.locked, 1 !== t.w && t.w !== t.minW || delete t.w, 1 !== t.h && t.h !== t.minH || delete t.h
                        }, t.closestUpByClass = function(t, e) {
                            for (; t;) {
                                if (t.classList.contains(e)) return t;
                                t = t.parentElement
                            }
                            return null
                        }, t.throttle = function(t, e) {
                            var i = !1;
                            return function() {
                                for (var o = [], n = 0; n < arguments.length; n++) o[n] = arguments[n];
                                i || (i = !0, setTimeout((function() { t.apply(void 0, o), i = !1 }), e))
                            }
                        }, t.removePositioningStyles = function(t) {
                            var e = t.style;
                            e.position && e.removeProperty("position"), e.left && e.removeProperty("left"), e.top && e.removeProperty("top"), e.width && e.removeProperty("width"), e.height && e.removeProperty("height")
                        }, t.getScrollElement = function(t) { if (!t) return document.scrollingElement || document.documentElement; var e = getComputedStyle(t); return /(auto|scroll)/.test(e.overflow + e.overflowY) ? t : this.getScrollElement(t.parentElement) }, t.updateScrollPosition = function(t, e, i) {
                            var o = t.getBoundingClientRect(),
                                n = window.innerHeight || document.documentElement.clientHeight;
                            if (o.top < 0 || o.bottom > n) {
                                var r = o.bottom - n,
                                    s = o.top,
                                    a = this.getScrollElement(t);
                                if (null !== a) {
                                    var l = a.scrollTop;
                                    o.top < 0 && i < 0 ? t.offsetHeight > n ? a.scrollTop += i : a.scrollTop += Math.abs(s) > Math.abs(i) ? i : s : i > 0 && (t.offsetHeight > n ? a.scrollTop += i : a.scrollTop += r > i ? i : r), e.top += a.scrollTop - l
                                }
                            }
                        }, t.updateScrollResize = function(t, e, i) {
                            var o = this.getScrollElement(e),
                                n = o.clientHeight,
                                r = o === this.getScrollElement() ? 0 : o.getBoundingClientRect().top,
                                s = t.clientY - r,
                                a = s > n - i;
                            s < i ? o.scrollBy({ behavior: "smooth", top: s - i }) : a && o.scrollBy({ behavior: "smooth", top: i - (n - s) })
                        }, t.clone = function(t) { return null == t || "object" != typeof t ? t : t instanceof Array ? o([], t, !0) : i({}, t) }, t.cloneDeep = function(e) {
                            var i = ["parentGrid", "el", "grid", "subGrid", "engine"],
                                o = t.clone(e),
                                n = function(n) { o.hasOwnProperty(n) && "object" == typeof o[n] && "__" !== n.substring(0, 2) && !i.find((function(t) { return t === n })) && (o[n] = t.cloneDeep(e[n])) };
                            for (var r in o) n(r);
                            return o
                        }, t.cloneNode = function(t) { var e = t.cloneNode(!0); return e.removeAttribute("id"), e }, t.appendTo = function(e, i) {
                            var o;
                            (o = "string" == typeof i ? t.getElement(i) : i) && o.appendChild(e)
                        }, t.addElStyles = function(t, e) { if (e instanceof Object) { var i = function(i) { e.hasOwnProperty(i) && (Array.isArray(e[i]) ? e[i].forEach((function(e) { t.style[i] = e })) : t.style[i] = e[i]) }; for (var o in e) i(o) } }, t.initEvent = function(t, e) {
                            var o = { type: e.type },
                                n = { button: 0, which: 0, buttons: 1, bubbles: !0, cancelable: !0, target: e.target ? e.target : t.target };
                            return t.dataTransfer && (o.dataTransfer = t.dataTransfer), ["altKey", "ctrlKey", "metaKey", "shiftKey"].forEach((function(e) { return o[e] = t[e] })), ["pageX", "pageY", "clientX", "clientY", "screenX", "screenY"].forEach((function(e) { return o[e] = t[e] })), i(i({}, o), n)
                        }, t.simulateMouseEvent = function(t, e, i) {
                            var o = document.createEvent("MouseEvents");
                            o.initMouseEvent(e, !0, !0, window, 1, t.screenX, t.screenY, t.clientX, t.clientY, t.ctrlKey, t.altKey, t.shiftKey, t.metaKey, 0, t.target), (i || t.target).dispatchEvent(o)
                        }, t
                    }();
                    e.Utils = n
                }
            },
            e = {},
            i = function i(o) { var n = e[o]; if (void 0 !== n) return n.exports; var r = e[o] = { exports: {} }; return t[o].call(r.exports, r, r.exports, i), r.exports }(324);
        return i.GridStack
    }()
}));
//# sourceMappingURL=gridstack-all.js.map