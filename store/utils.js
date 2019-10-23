"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formatNumber = function (n) {
    var str = n.toString();
    return str[1] ? str : '0' + str;
};
exports.formatNumber = formatNumber;
var formatTime = function (date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};
exports.formatTime = formatTime;
var methods = [
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
exports.methods = methods;
var triggerStr = [
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
exports.triggerStr = triggerStr;
var isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
exports.isArray = isArray;
var isString = function (obj) {
    return typeof obj === 'string';
};
exports.isString = isString;
var isInArray = function (arr, item) {
    for (var i = arr.length; --i > -1;) {
        if (item === arr[i])
            return true;
    }
    return false;
};
exports.isInArray = isInArray;
var isFunction = function (obj) {
    return Object.prototype.toString.call(obj) == '[object Function]';
};
exports.isFunction = isFunction;
var _getRootName = function (prop, path) {
    if (path === '#') {
        return prop;
    }
    return path.split('-')[1];
};
exports._getRootName = _getRootName;
var add = function (obj, prop) {
    var $observer = obj.$observer;
    $observer.watch(obj, prop);
};
exports.add = add;
var set = function (obj, prop, value, exec) {
    if (!exec) {
        obj[prop] = value;
    }
    var $observer = obj.$observer;
    $observer.watch(obj, prop);
    if (exec) {
        obj[prop] = value;
    }
};
exports.set = set;
Array.prototype.size = function (length) {
    this.length = length;
};
var nan = function (value) {
    return typeof value === "number" && isNaN(value);
};
exports.nan = nan;
