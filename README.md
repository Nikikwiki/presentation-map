# Встраиваемая карта для отображения новостей.
Реализованы функции:
  1. Просмотр срезов слоёв по датам.
  2. Просмотр легенды слоёв для среза.
  3. Зум карты только через кнопки / CTRL+Scroll
  4. Интерактивное сравнение срезов по датам.
  5. Просмотр информации о фиче в сайдбаре.
  6. Механизм кластеризации, зум до кластеризованных точек, просмотр списка кластеризованных точек.

## Настройка
Добавлена возможность настройки отображаемой карты. Для этого нужно настроить файл map-config.json.
Имеет следующие настройки:
```
interface MapConfig {
    center: number[], // центрирование карты
    zoom: number,
    minZoom: number,
    maxZoom: number,
    extent: number[], // границы показа карты
    hasCompare: boolean // вкл/выкл сравнения
}
```

Добавлена возможность настройки срезов. Для этого нужно настроить файл slices.json.
Имеет следующие настройки:
```
interface Slice {
    id: number,
    date: string,
    layers: Layer[],
    sliderText: string, // название среза на слайдере
    sliderLabel: string // лейбл среза при переключении слайдера
}

interface Layer {
    type: 'vector' | 'tile' | 'grid' | 'legend', // тип слоя
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
    name: string, // [optional] название слоя в легенде (обязателен для отображения в легенды)
    displayIcon: string, // [optional] ссылка на картинку для отображения в легенде (обязателен для отображения в легенды)
    sharedId: string // [optional] общий ID слоев для скрытия
    text: boolean // [optional] подпись к кластеру
    fillText: string, // [optional] цвет текста подписи
    offsetXText: number // [optional] смещение текста относительно иконки по Х
    offsetYText: number // [optional] смещение текста относительно иконки по Y
    scaleText: number // [optional] размер текста
}
```

## Запуск

* `git clone https://github.com/Nikikwiki/presentation-map.git`
* `cd presentation-map`
* `npm install`
* `npm start`

## Стэк:
  * TypeScript
  * React.js
  * SCSS
  * Webpack
  * Axios
  * MaterialUI
  * OpenLayers
