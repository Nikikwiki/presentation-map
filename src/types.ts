export interface MapConfig {
    center: number[], // центрирование карты
    zoom: number,
    minZoom: number,
    maxZoom: number,
    extent: number[], // границы показа карты
    hasCompare: boolean // вкл/выкл сравнения
}

export interface Slice {
    id: number,
    date: string,
    layers: Layer[],
    sliderText: string, // название среза на слайдере
    sliderLabel: string // лейбл среза при переключении слайдера
}

export interface Layer {
    type: string, // тип слоя
    url: string, // сслыка на слой
    width: number, // [optional] размер рисованой картинки
    fillColor: number[], // [optional] цвет заполнения
    strokeColor: number[], // [optional] цвет обводки
    strokeWidth: number, // [optional] толщина обводкии
    iconSrc: string, // ссылка на картинку для отображения на карте
    iconSize: number, // [optional] размер картинки
    iconScale: number, // [optional] масштаб картинки
    cluster: boolean, // [optional] кластеризовать слой
    distance: number, // [optional] дальность кластеризации
    name: string, // [optional] название слоя в легенде
    displayIcon: string, // [optional] ссылка на картинку для отображения в легенде
    sharedId: string // [optional] общий ID слоев для скрытия
    text: boolean // [optional] подпись к кластеру
    fillText: string, // [optional] цвет текста подписи
    offsetXText: number // [optional] смещение текста относительно иконки по Х
    offsetYText: number // [optional] смещение текста относительно иконки по Y
    scaleText: number // [optional] размер текста
}

export interface LayerWithUrl extends Layer {
    layerByUrl: any
}
