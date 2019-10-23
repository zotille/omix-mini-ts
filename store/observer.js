"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var Observer = (function () {
    function Observer(target, arr, callback) {
        var eventPropArr = [];
        if (utils_1.isArray(target)) {
            if (target.length === 0) {
                Object.defineProperty(target, '$observeProps', {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: {}
                });
                target.$observeProps.$observerPath = '#';
            }
            this.mock(target);
        }
        for (var prop in target) {
            if (target.hasOwnProperty(prop)) {
                if (callback) {
                    if (utils_1.isArray(arr) && utils_1.isInArray(arr, prop)) {
                        eventPropArr.push(prop);
                        this.watch(target, prop);
                    }
                    else if (utils_1.isString(arr) && prop == arr) {
                        eventPropArr.push(prop);
                        this.watch(target, prop);
                    }
                }
                else {
                    eventPropArr.push(prop);
                    this.watch(target, prop);
                }
            }
        }
        this.target = target;
        if (!this.propertyChangedHandler) {
            this.propertyChangedHandler = [];
        }
        var propChanged = callback ? callback : arr;
        this.propertyChangedHandler.push({
            all: !callback,
            propChanged: propChanged,
            eventPropArr: eventPropArr
        });
    }
    ;
    Observer.prototype.onPropertyChanged = function (prop, value, oldValue, target, path) {
        if (value !== oldValue && (!(utils_1.nan(value) && utils_1.nan(oldValue))) && this.propertyChangedHandler) {
            var rootName = utils_1._getRootName(prop, path);
            for (var i = 0, len = this.propertyChangedHandler.length; i < len; i++) {
                var handler = this.propertyChangedHandler[i];
                if (handler.all ||
                    utils_1.isInArray(handler.eventPropArr, rootName) ||
                    rootName.indexOf('Array-') === 0) {
                    handler.propChanged.call(this.target, prop, value, oldValue, path);
                }
            }
        }
        if (prop.indexOf('Array-') !== 0 && typeof value === 'object') {
            this.watch(target, prop, target.$observeProps.$observerPath);
        }
    };
    Observer.prototype.mock = function (target) {
        var self = this;
        utils_1.methods.forEach(function (item) {
            target[item] = function () {
                var old = Array.prototype.slice.call(this, 0);
                var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
                if (new RegExp('\\b' + item + '\\b').test(utils_1.triggerStr)) {
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && !utils_1.isFunction(this[key])) {
                            self.watch(this, key, this.$observeProps.$observerPath);
                        }
                    }
                    self.onPropertyChanged('Array-' + item, this, old, this, this.$observeProps.$observerPath);
                }
                return result;
            };
            target['pure' + item.substring(0, 1).toUpperCase() + item.substring(1)] = function () {
                return Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
            };
        });
    };
    Observer.prototype.watch = function (target, prop, path) {
        if (prop === '$observeProps' || prop === '$observer')
            return;
        if (utils_1.isFunction(target[prop]))
            return;
        if (!target.$observeProps) {
            Object.defineProperty(target, '$observeProps', {
                configurable: true,
                enumerable: false,
                writable: true,
                value: {}
            });
        }
        if (path !== undefined) {
            target.$observeProps.$observerPath = path;
        }
        else {
            target.$observeProps.$observerPath = '#';
        }
        var self = this;
        var currentValue = (target.$observeProps[prop] = target[prop]);
        Object.defineProperty(target, prop, {
            get: function () {
                return this.$observeProps[prop];
            },
            set: function (value) {
                var old = this.$observeProps[prop];
                this.$observeProps[prop] = value;
                self.onPropertyChanged(prop, value, old, this, target.$observeProps.$observerPath);
            }
        });
        if (typeof currentValue == 'object') {
            if (utils_1.isArray(currentValue)) {
                this.mock(currentValue);
                if (currentValue.length === 0) {
                    if (!currentValue.$observeProps) {
                        Object.defineProperty(currentValue, '$observeProps', {
                            configurable: true,
                            enumerable: false,
                            writable: true,
                            value: {}
                        });
                    }
                    if (path !== undefined) {
                        currentValue.$observeProps.$observerPath = path + '-' + prop;
                    }
                    else {
                        currentValue.$observeProps.$observerPath = '#' + '-' + prop;
                    }
                }
            }
            for (var cprop in currentValue) {
                if (currentValue.hasOwnProperty(cprop)) {
                    this.watch(currentValue, cprop, target.$observeProps.$observerPath + '-' + prop);
                }
            }
        }
    };
    return Observer;
}());
exports.default = Observer;
