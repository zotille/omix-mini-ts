(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.omix_mini = {}));
}(this, function (exports) { 'use strict';

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
  var isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
  };
  var isString = function (obj) {
      return typeof obj === 'string';
  };
  var isInArray = function (arr, item) {
      for (var i = arr.length; --i > -1;) {
          if (item === arr[i])
              return true;
      }
      return false;
  };
  var isFunction = function (obj) {
      return Object.prototype.toString.call(obj) == '[object Function]';
  };
  var _getRootName = function (prop, path) {
      if (path === '#') {
          return prop;
      }
      return path.split('-')[1];
  };
  Array.prototype.size = function (length) {
      this.length = length;
  };
  var nan = function (value) {
      return typeof value === "number" && isNaN(value);
  };

  var Observer = (function () {
      function Observer(target, arr, callback) {
          var eventPropArr = [];
          if (isArray(target)) {
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
                      if (isArray(arr) && isInArray(arr, prop)) {
                          eventPropArr.push(prop);
                          this.watch(target, prop);
                      }
                      else if (isString(arr) && prop == arr) {
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
      Observer.prototype.onPropertyChanged = function (prop, value, oldValue, target, path) {
          if (value !== oldValue && (!(nan(value) && nan(oldValue))) && this.propertyChangedHandler) {
              var rootName = _getRootName(prop, path);
              for (var i = 0, len = this.propertyChangedHandler.length; i < len; i++) {
                  var handler = this.propertyChangedHandler[i];
                  if (handler.all ||
                      isInArray(handler.eventPropArr, rootName) ||
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
          methods.forEach(function (item) {
              target[item] = function () {
                  var old = Array.prototype.slice.call(this, 0);
                  var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
                  if (new RegExp('\\b' + item + '\\b').test(triggerStr)) {
                      for (var key in this) {
                          if (this.hasOwnProperty(key) && !isFunction(this[key])) {
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
          if (isFunction(target[prop]))
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
              if (isArray(currentValue)) {
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

  var obaa = function (target, arr, callback) {
      return new Observer(target, arr, callback);
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

  /*!
   *  omix v1.0.2 by dntzhang
   *  Github: https://github.com/Tencent/omi
   *  MIT Licensed.
   */
  var ARRAYTYPE = "[object Array]";
  var OBJECTTYPE = "[object Object]";
  var FUNCTIONTYPE = "[object Function]";
  function _Page(option) {
      var onLoad = option.onLoad;
      option.onLoad = function (e) {
          this.context = option.context;
          this.oData = JSON.parse(JSON.stringify(option.data));
          if (!option.data.___walked) {
              walk(option.data, true);
          }
          this.setData(option.data);
          observe(this, option.data);
          onLoad && onLoad.call(this, e);
      };
      Page(option);
  }
  function _Component(option) {
      var ready = option.ready;
      option.ready = function () {
          var page = getCurrentPages()[getCurrentPages().length - 1];
          this.context = option.context || page.context;
          option.data = option.data || {};
          this.oData = JSON.parse(JSON.stringify(option.data));
          if (!option.data.___walked) {
              walk(option.data, true);
          }
          observe(this, option.data);
          ready && ready.call(this);
      };
      Component(option);
  }
  function fixPath(path) {
      var mpPath = "";
      var arr = path.replace("#-", "").split("-");
      arr.forEach(function (item, index) {
          if (index) {
              if (isNaN(parseInt(item))) {
                  mpPath += "." + item;
              }
              else {
                  mpPath += "[" + item + "]";
              }
          }
          else {
              mpPath += item;
          }
      });
      return mpPath;
  }
  function observe(ele, data) {
      obaa(ele.oData, function (prop, value, old, path) {
          var patch = {};
          if (prop.indexOf("Array-push") === 0) {
              var dl = value.length - old.length;
              for (var i = 0; i < dl; i++) {
                  patch[fixPath(path + "-" + (old.length + i))] = value[old.length + i];
              }
          }
          else if (prop.indexOf("Array-") === 0) {
              patch[fixPath(path)] = value;
          }
          else {
              patch[fixPath(path + "-" + prop)] = value;
          }
          ele.setData(patch);
          updateByFnProp(ele, data);
      });
  }
  function updateByFnProp(ele, data) {
      var patch = {};
      for (var key in data.__fnMapping) {
          patch[key] = data.__fnMapping[key].call(ele.oData);
      }
      ele.setData(patch);
  }
  function create(store, option) {
      if (arguments.length === 2) {
          if (!store.instances) {
              store.instances = {};
          }
          getApp().globalData && (getApp().globalData.store = store);
          var tOption = option;
          tOption.data = tOption.data;
          tOption.data.store = store.data;
          observeStore(store);
          var onLoad_1 = tOption.onLoad;
          tOption.onLoad = function (e) {
              this.store = store;
              this.context = tOption.context;
              var temp = tOption.data && tOption.data.store;
              delete tOption.data.store;
              this.oData = JSON.parse(JSON.stringify(tOption.data));
              if (!tOption.data.___walked) {
                  walk(tOption.data, true);
              }
              observe(this, tOption.data);
              tOption.data.store = temp;
              store.instances[this.route] = [];
              store.instances[this.route].push(this);
              if (!tOption.data.store.___walked) {
                  walk(this.store.data);
              }
              this.setData.call(this, tOption.data);
              onLoad_1 && onLoad_1.call(this, e);
          };
          Page(tOption);
      }
      else {
          var ready_1 = store.ready;
          store.ready = function () {
              var page = getCurrentPages()[getCurrentPages().length - 1];
              this.context = store.context || page.context;
              this.store = page.store;
              store.data = store.data || {};
              store.data.store = this.store.data;
              this.setData.call(this, store.data);
              this.store.instances[page.route].push(this);
              ready_1 && ready_1.call(this);
          };
          Component(store);
      }
  }
  function observeStore(store) {
      obaa(store.data, function (prop, value, old, path) {
          var patch = {};
          if (prop.indexOf("Array-push") === 0) {
              var dl = value.length - old.length;
              for (var i = 0; i < dl; i++) {
                  patch["store." + fixPath(path + "-" + (old.length + i))] =
                      value[old.length + i];
              }
          }
          else if (prop.indexOf("Array-") === 0) {
              patch["store." + fixPath(path)] = value;
          }
          else {
              patch["store." + fixPath(path + "-" + prop)] = value;
          }
          _update(patch, store);
      });
  }
  function _update(kv, store) {
      for (var key in store.instances) {
          store.instances[key].forEach(function (ins) {
              ins.setData.call(ins, kv);
              updateStoreByFnProp(ins, store.data);
          });
      }
      store.onChange && store.onChange(kv);
       storeChangeLogger(store);
  }
  function storeChangeLogger(store) {
      store.onChange = function (diffResult) {
          try {
              var preState = wx.getStorageSync("CurrentState") || {};
              var title = "State Changed";
              console.groupCollapsed("%c  " + title + " %c " + Object.keys(diffResult), "color:#e0c184; font-weight: bold", "color:#f0a139; font-weight: bold");
              console.log("%c    Pre State", "color:#ff65af; font-weight: bold", preState);
              console.log("%c Change State", "color:#3d91cf; font-weight: bold", diffResult);
              console.log("%c   Next State", "color:#2c9f67; font-weight: bold", store.data);
              console.groupEnd();
              wx.setStorageSync("CurrentState", store.data);
          }
          catch (e) {
              console.log(e);
          }
      };
  }
  function updateStoreByFnProp(ele, data) {
      if (data.store) {
          var patch = {};
          for (var key in data.store.__fnMapping) {
              patch["store." + key] = data.store.__fnMapping[key].call(data);
          }
          ele.setData(patch);
      }
  }
  function getObjByPath(path, data) {
      var arr = path
          .replace(/]/g, "")
          .replace(/\[/g, ".")
          .split(".");
      var len = arr.length;
      if (len > 1) {
          var current = data[arr[0]];
          for (var i = 1; i < len - 1; i++) {
              current = current[arr[i]];
          }
          return { obj: current, key: arr[len - 1] };
      }
      else {
          return { obj: data, key: arr[0] };
      }
  }
  function walk(data, tag) {
      data.___walked = true;
      Object.keys(data).forEach(function (key) {
          var obj = data[key];
          var tp = type(obj);
          if (tp == FUNCTIONTYPE) {
              setProp(key, obj, data, tag);
          }
          else if (tp == OBJECTTYPE) {
              Object.keys(obj).forEach(function (subKey) {
                  _walk(obj[subKey], key + "." + subKey, data, tag);
              });
          }
          else if (tp == ARRAYTYPE) {
              obj.forEach(function (item, index) {
                  _walk(item, key + "[" + index + "]", data, tag);
              });
          }
      });
  }
  function _walk(obj, path, data, tag) {
      var tp = type(obj);
      if (tp == FUNCTIONTYPE) {
          setProp(path, obj, data, tag);
      }
      else if (tp == OBJECTTYPE) {
          Object.keys(obj).forEach(function (subKey) {
              _walk(obj[subKey], path + "." + subKey, data, tag);
          });
      }
      else if (tp == ARRAYTYPE) {
          obj.forEach(function (item, index) {
              _walk(item, path + "[" + index + "]", data, tag);
          });
      }
  }
  function setProp(path, fn, data, tag) {
      var ok = getObjByPath(path, data);
      if (tag) {
          data.__fnMapping = data.__fnMapping || {};
          data.__fnMapping[path] = fn;
          Object.defineProperty(ok.obj, ok.key, {
              enumerable: true,
              get: function () {
                  return fn.call(ok.obj);
              },
              set: function () {
                  console.warn("Please using this.data.method to set method prop of data!");
              }
          });
      }
      else {
          data.store = data.store || {};
          data.store.__fnMapping = data.store.__fnMapping || {};
          data.store.__fnMapping[path] = fn;
          Object.defineProperty(ok.obj.store, ok.key, {
              enumerable: true,
              get: function () {
                  return fn.call(ok.obj);
              },
              set: function () {
                  console.warn("Please using this.data.method to set method prop of data!");
              }
          });
      }
  }
  function type(obj) {
      return Object.prototype.toString.call(obj);
  }
  create.Page = _Page;
  create.Component = _Component;
  create.obaa = obaa;

  exports.create = create;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
