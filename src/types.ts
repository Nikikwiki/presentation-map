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
    url: string
}
