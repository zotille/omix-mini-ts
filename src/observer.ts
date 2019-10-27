import {
  isArray,
  isInArray,
  isString,
  nan,
  _getRootName,
  methods,
  triggerStr,
  isFunction
} from './utils'

export default class Observer {
  propertyChangedHandler?: any[];
  target?: any

  constructor(target: any, arr, callback) {
    let eventPropArr: string[] = [];
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
    for (let prop in target) {
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
  };

  onPropertyChanged(prop, value, oldValue, target, path) {
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
  }

  /**
   * 重写Array的方法
   * @param target 
   */
  mock(target: any[]) {
    var self = this;
    methods.forEach(function (item: string) {
      target[item] = function () {
        // 将原本的数组复制一份；
        var old = Array.prototype.slice.call(this, 0);
        // 调用Array.prototype中本来的方法对数组进行修改；
        var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));

        // 弱类型的弊端，Array同样可以记录键值对；
        if (new RegExp('\\b' + item + '\\b').test(triggerStr)) {
          for (let key in this) {
            if (this.hasOwnProperty(key) && !isFunction(this[key])) {
              self.watch(this, key, (this as any).$observeProps.$observerPath);
            }
          }
          self.onPropertyChanged('Array-' + item, this, old, this, (this as any).$observeProps.$observerPath);
        }
        return result;
      };
      // 保留原始方法，调用原始方法不会更新；
      target['pure' + item.substring(0, 1).toUpperCase() + item.substring(1)] = function () {
        return Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
      };
    });
  }

  /**
   * 对象类型的观测
   * @param target 
   * @param prop 
   * @param path 
   */
  watch(target: any, prop: any, path?: any): void {
    if (prop === '$observeProps' || prop === '$observer')
      return;
    if (isFunction(target[prop]))
      return;
    // ↑↑↑↑↑ 不观测对象上的方法 ↑↑↑↑↑
    if (!target.$observeProps) {
      Object.defineProperty(target, '$observeProps', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: {}
      });
    }

    // 观测路径
    if (path !== undefined) {
      target.$observeProps.$observerPath = path;
    } else {
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
  }
}