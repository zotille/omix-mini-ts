const formatNumber = (n: number) => {
  let str = n.toString();
  return str[1] ? str : '0' + str;
};

const formatTime = (date: Date) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

const methods = [
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
const triggerStr = [
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
const isArray = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};
const isString = function (obj) {
  return typeof obj === 'string';
};
const isInArray = function (arr, item) {
  for (var i = arr.length; --i > -1;) {
      if (item === arr[i])
          return true;
  }
  return false;
};
const isFunction = function (obj) {
  return Object.prototype.toString.call(obj) == '[object Function]';
};
const _getRootName = function (prop, path) {
  if (path === '#') {
      return prop;
  }
  return path.split('-')[1];
};
const add = function (obj, prop) {
  var $observer = obj.$observer;
  $observer.watch(obj, prop);
};
const set = function (obj, prop, value, exec) {
  if (!exec) {
      obj[prop] = value;
  }
  var $observer = obj.$observer;
  $observer.watch(obj, prop);
  if (exec) {
      obj[prop] = value;
  }
};
(Array.prototype as any).size = function (length) {
  this.length = length;
};
const nan = function(value) {
  return typeof value === "number" && isNaN(value);
}


export {
  formatTime,
  formatNumber,
  methods,
  triggerStr,
  isArray,
  isString,
  isInArray,
  isFunction,
  _getRootName,
  add,
  set,
  nan
}