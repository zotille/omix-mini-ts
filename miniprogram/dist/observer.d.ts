export default class Observer {
    propertyChangedHandler?: any[];
    target?: any;
    constructor(target: any, arr: any, callback: any);
    onPropertyChanged(prop: any, value: any, oldValue: any, target: any, path: any): void;
    mock(target: any[]): void;
    watch(target: any, prop: any, path?: any): void;
}
