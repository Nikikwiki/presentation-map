export interface ConfigType {
    center: number[],
    zoom: number,
    minZoom: number,
    maxZoom: number,
    extent: number[],
    slices: Slice[]
}

export interface Slice {
    date: string,
    type: string,
    crs: string,
    features: any[]
}
