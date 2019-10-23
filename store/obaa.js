"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observer_1 = require("./observer");
var obaa = function (target, arr, callback) {
    return new observer_1.default(target, arr, callback);
};
obaa.methods = [
    'concat',
    'copyWithin',
    'entries',
    'every',
    'fill',
    'filter',
    'find',
    'findIndex',
    'forEach',
    'includes',
    'indexOf',
    'join',
    'keys',
    'lastIndexOf',
    'map',
    'pop',
    'push',
    'reduce',
    'reduceRight',
    'reverse',
    'shift',
    'slice',
    'some',
    'sort',
    'splice',
    'toLocaleString',
    'toString',
    'unshift',
    'values',
    'size'
];
obaa.triggerStr = [
    'concat',
    'copyWithin',
    'fill',
    'pop',
    'push',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift',
    'size'
].join(',');
obaa.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
obaa.isString = function (obj) {
    return typeof obj === 'string';
};
obaa.isInArray = function (arr, item) {
    for (var i = arr.length; --i > -1;) {
        if (item === arr[i])
            return true;
    }
    return false;
};
obaa.isFunction = function (obj) {
    return Object.prototype.toString.call(obj) == '[object Function]';
};
obaa._getRootName = function (prop, path) {
    if (path === '#') {
        return prop;
    }
    return path.split('-')[1];
};
obaa.add = function (obj, prop) {
    var $observer = obj.$observer;
    $observer.watch(obj, prop);
};
obaa.set = function (obj, prop, value, exec) {
    if (!exec) {
        obj[prop] = value;
    }
    var $observer = obj.$observer;
    $observer.watch(obj, prop);
    if (exec) {
        obj[prop] = value;
    }
};
Array.prototype.size = function (length) {
    this.length = length;
};
function nan(value) {
    return typeof value === "number" && isNaN(value);
}
exports.default = obaa;
