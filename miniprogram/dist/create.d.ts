/*!
 *  omix v1.0.2 by dntzhang
 *  Github: https://github.com/Tencent/omi
 *  MIT Licensed.
 */
/// <reference types="miniprogram-api-typings" />
declare function _Page(option: any): void;
declare function _Component(option: any): void;
interface Store {
    [key: string]: any;
    data: {
        [key: string]: any;
    };
}
declare type DataOption = WechatMiniprogram.Page.DataOption;
declare type CustomOption = WechatMiniprogram.Page.CustomOption;
declare function create<TData extends DataOption, TCustom extends CustomOption>(store: Store, option: WechatMiniprogram.Page.Options<TData, TCustom>): void;
declare namespace create {
    var Page: typeof _Page;
    var Component: typeof _Component;
    var obaa: {
        (target: any, arr: any, callback?: any): import("./observer").default;
        methods: string[];
        triggerStr: string;
        isArray(obj: any): boolean;
        isString(obj: any): boolean;
        isInArray(arr: any, item: any): boolean;
        isFunction(obj: any): boolean;
        _getRootName(prop: any, path: any): any;
        add(obj: any, prop: any): void;
        set(obj: any, prop: any, value: any, exec: any): void;
    };
}
export default create;
