export interface MapConfig {
    center: number[],
    zoom: number,
    minZoom: number,
    maxZoom: number,
    extent: number[],
}

export interface Slice {
    id: number,
    date: string,
    type: string,
    layers: Layer[]
}

export interface Layer {
    type: string,
    url: string,
    width: number,
    fillColor: number[],
    strokeColor: number[],
    iconSrc: string,
    iconSize: number,
    iconScale: number,
    cluster: boolean,
    distance: number,
    name: string
}
