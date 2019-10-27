/*!
 *  omix v1.0.2 by dntzhang
 *  Github: https://github.com/Tencent/omi
 *  MIT Licensed.
 */

import obaa from "./obaa";
// import mitt from "./mitt";
import config from "./config";

const ARRAYTYPE = "[object Array]";
const OBJECTTYPE = "[object Object]";
const FUNCTIONTYPE = "[object Function]";

function _Page(option) {
  const onLoad = option.onLoad;
  option.onLoad = function (e) {
    this.context = option.context;
    this.oData = JSON.parse(JSON.stringify(option.data));
    if (!option.data.___walked) {
      walk(option.data, true);
    }
    //fn prop
    this.setData(option.data);
    observe(this, option.data);
    onLoad && onLoad.call(this, e);
  };
  Page(option);
}

function _Component(option) {
  const ready = option.ready;
  option.ready = function () {
    const page = getCurrentPages()[getCurrentPages().length - 1];
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
  let mpPath = "";
  const arr = path.replace("#-", "").split("-");
  arr.forEach((item, index) => {
    if (index) {
      if (isNaN(parseInt(item))) {
        mpPath += "." + item;
      } else {
        mpPath += "[" + item + "]";
      }
    } else {
      mpPath += item;
    }
  });
  return mpPath;
}

function observe(ele, data) {
  obaa(ele.oData, (prop, value, old, path) => {
    let patch = {};
    if (prop.indexOf("Array-push") === 0) {
      let dl = value.length - old.length;
      for (let i = 0; i < dl; i++) {
        patch[fixPath(path + "-" + (old.length + i))] = value[old.length + i];
      }
    } else if (prop.indexOf("Array-") === 0) {
      patch[fixPath(path)] = value;
    } else {
      patch[fixPath(path + "-" + prop)] = value;
    }

    ele.setData(patch);
    //update fn prop
    updateByFnProp(ele, data);
  });
}

function updateByFnProp(ele, data) {
  let patch = {};
  for (let key in data.__fnMapping) {
    patch[key] = data.__fnMapping[key].call(ele.oData);
  }
  ele.setData(patch);
}

interface Store {
  [key: string]: any
  data: {
    [key: string]: any
  }
}
type DataOption = WechatMiniprogram.Page.DataOption;
type CustomOption = WechatMiniprogram.Page.CustomOption;
function create<TData extends DataOption, TCustom extends CustomOption>(store: Store, option: WechatMiniprogram.Page.Options<TData, TCustom>): void {
  if (arguments.length === 2) {
    if (!store.instances) {
      store.instances = {};
    }

    getApp().globalData && (getApp().globalData.store = store);
    var tOption = option as any;
    tOption.data = tOption.data;
    tOption.data.store = store.data;
    observeStore(store);
    const onLoad = tOption.onLoad;

    tOption.onLoad = function (e) {
      this.store = store;
      this.context = tOption.context;
      const temp = tOption.data && tOption.data.store;
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
      onLoad && onLoad.call(this, e);
    };
    Page(tOption);
  } else {
    const ready = store.ready;
    store.ready = function () {
      const page = getCurrentPages()[getCurrentPages().length - 1];
      this.context = store.context || page.context;
      this.store = page.store;

      store.data = store.data || {};
      store.data.store = this.store.data;
      this.setData.call(this, store.data);

      this.store.instances[page.route].push(this);
      ready && ready.call(this);
    };
    Component(store);
  }
}

function observeStore(store: Store) {
  obaa(store.data, (prop, value, old, path) => {
    let patch = {};
    if (prop.indexOf("Array-push") === 0) {
      let dl = value.length - old.length;
      for (let i = 0; i < dl; i++) {
        patch["store." + fixPath(path + "-" + (old.length + i))] =
          value[old.length + i];
      }
    } else if (prop.indexOf("Array-") === 0) {
      patch["store." + fixPath(path)] = value;
    } else {
      patch["store." + fixPath(path + "-" + prop)] = value;
    }
    _update(patch, store);
  });
}

function _update(kv, store) {
  for (let key in store.instances) {
    store.instances[key].forEach(ins => {
      ins.setData.call(ins, kv);
      updateStoreByFnProp(ins, store.data);
    });
  }
  store.onChange && store.onChange(kv);
  config.logger.isOpen && storeChangeLogger(store);
}

function storeChangeLogger(store) {
  store.onChange = diffResult => {
    try {
      const preState = wx.getStorageSync(`CurrentState`) || {};
      const title = `State Changed`;
      (console as any).groupCollapsed(
        `%c  ${title} %c ${Object.keys(diffResult)}`,
        "color:#e0c184; font-weight: bold",
        "color:#f0a139; font-weight: bold"
      );
      console.log(
        `%c    Pre State`,
        "color:#ff65af; font-weight: bold",
        preState
      );
      console.log(
        `%c Change State`,
        "color:#3d91cf; font-weight: bold",
        diffResult
      );
      console.log(
        `%c   Next State`,
        "color:#2c9f67; font-weight: bold",
        store.data
      );
      console.groupEnd();
      wx.setStorageSync(`CurrentState`, store.data);
    } catch (e) {
      console.log(e);
    }
  };
}

function updateStoreByFnProp(ele, data) {
  if (data.store) {
    let patch = {};
    for (let key in data.store.__fnMapping) {
      patch["store." + key] = data.store.__fnMapping[key].call(data);
    }
    ele.setData(patch);
  }
}

function extendStoreMethod(data) {
  data.method = function (path, fn) {
    //fnMapping[path] = fn
    //data??
    data.__fnMapping = data.__fnMapping || {};
    data.__fnMapping[path] = fn;
    let ok = getObjByPath(path, data);
    Object.defineProperty(ok.obj, ok.key, {
      enumerable: true,
      get: () => {
        return fn.call(data);
      },
      set: () => {
        console.warn(
          "Please using this.data.method to set method prop of data!"
        );
      }
    });
  };
}

function getObjByPath(path, data) {
  const arr = path
    .replace(/]/g, "")
    .replace(/\[/g, ".")
    .split(".");
  const len = arr.length;
  if (len > 1) {
    let current = data[arr[0]];
    for (let i = 1; i < len - 1; i++) {
      current = current[arr[i]];
    }
    return { obj: current, key: arr[len - 1] };
  } else {
    return { obj: data, key: arr[0] };
  }
}

function walk(data, tag?: any) {
  data.___walked = true;
  Object.keys(data).forEach(key => {
    const obj = data[key];
    const tp = type(obj);
    if (tp == FUNCTIONTYPE) {
      setProp(key, obj, data, tag);
    } else if (tp == OBJECTTYPE) {
      Object.keys(obj).forEach(subKey => {
        _walk(obj[subKey], key + "." + subKey, data, tag);
      });
    } else if (tp == ARRAYTYPE) {
      obj.forEach((item, index) => {
        _walk(item, key + "[" + index + "]", data, tag);
      });
    }
  });
}

function _walk(obj, path, data, tag) {
  const tp = type(obj);
  if (tp == FUNCTIONTYPE) {
    setProp(path, obj, data, tag);
  } else if (tp == OBJECTTYPE) {
    Object.keys(obj).forEach(subKey => {
      _walk(obj[subKey], path + "." + subKey, data, tag);
    });
  } else if (tp == ARRAYTYPE) {
    obj.forEach((item, index) => {
      _walk(item, path + "[" + index + "]", data, tag);
    });
  }
}

function setProp(path, fn, data, tag) {
  const ok = getObjByPath(path, data);

  if (tag) {
    data.__fnMapping = data.__fnMapping || {};
    data.__fnMapping[path] = fn;
    Object.defineProperty(ok.obj, ok.key, {
      enumerable: true,
      get: () => {
        return fn.call(ok.obj);
      },
      set: () => {
        console.warn(
          "Please using this.data.method to set method prop of data!"
        );
      }
    });
  } else {
    data.store = data.store || {};
    data.store.__fnMapping = data.store.__fnMapping || {};
    data.store.__fnMapping[path] = fn;
    Object.defineProperty(ok.obj.store, ok.key, {
      enumerable: true,
      get: () => {
        return fn.call(ok.obj);
      },
      set: () => {
        console.warn(
          "Please using this.data.method to set method prop of data!"
        );
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
// console.log(mitt)
// create.mitt = mitt;
// create.emitter = mitt();

export default create;
