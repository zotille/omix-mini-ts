import Observer from "./observer";
declare const obaa: {
    (target: any, arr: any, callback?: any): Observer;
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
export default obaa;
