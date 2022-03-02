declare const __PRODUCTION__: string;
declare const __DEVELOPMENT__: string;
declare const __ENV__: string;
declare module 'ol-ext/control/Swipe'
declare function getLng(): string;

type Nullable<T> = T | null;

declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}
