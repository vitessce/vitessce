declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.svg';
declare module '*.ico';
declare module '*.webp';
declare module '*.gif';
declare module '*.ttf';

declare module '*.scss';
declare module '*.sass';

declare module '*.json';

declare const PRODUCTION: string;

declare interface Function {
   bindArgs(...boundArgs: any): (...args: any) => any;
   rebind(thisArg: any): (...args: any) => any;
}
declare module 'd3-force-boundary';