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
    type: string, // тип слоя
    url: string, // сслыка на слой
    width: number, // размер рисованой картинки
    fillColor: number[], // цвет заполнения
    strokeColor: number[], // цвет обводки
    iconSrc: string, // ссылка на картинку для отображения на карте
    iconSize: number, // размер картинки
    iconScale: number, // масштаб картинки
    cluster: boolean, // кластеризовать слой
    distance: number, // дальность кластеризации
    name: string, // название слоя в легенде
    displayIcon: string, // ссылка на картинку для отображения в легенде
    sharedId: string // общий ID слоев для скрытия
}
