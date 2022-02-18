import React, { useEffect, useRef, useState } from 'react';

import * as olControl from 'ol/control';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { MouseWheelZoom, defaults } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import { apiService } from 'api-service';

import 'rc-slider/assets/index.css';
import { ConfigType } from 'types';
import { AxiosResponse } from 'axios';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { DateSlider } from 'components/date-slider';
import styles from './styles.scss';

export const MapComponent = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    let map: OlMap = new OlMap({});

    const [ layerDate, setLayerDate ] = useState(new Date());
    const [ config, setConfig ] = useState<ConfigType>({
        center: [],
        zoom: 0,
        minZoom: 0,
        maxZoom: 0,
        extent: [],
        slices: []
    });

    const image = new CircleStyle({
        radius: 10,
        fill: new Fill({
            color: '#FF9000'
        }),
        stroke: new Stroke({ color: 'yellow', width: 4 })
    });

    const handleDateChange = (value: Date) => {
        setLayerDate(value);
    };

    useEffect(() => {
        apiService.getConfig().then((res: AxiosResponse<any>) => {
            setConfig((prev) => ({ ...prev, ...res.data }));
            setTimeout(() => {
                console.log(config);
                console.log(res.data);
            }, 1000);

            if (mapRef.current) {
                map = new OlMap({
                    target: mapRef.current,
                    layers: [
                        new TileLayer({
                            source: new OSM()
                        }),
                        new VectorLayer({
                            source: new VectorSource({
                                features: new GeoJSON().readFeatures(config.slices[1], {
                                    dataProjection: 'EPSG:4326',
                                    featureProjection: 'EPSG:3857'
                                })
                            }),
                            style: new Style({
                                image: image
                            })
                        })
                    ],
                    view: new View({
                        center: config.center,
                        zoom: config.zoom,
                        minZoom: config.minZoom,
                        maxZoom: config.maxZoom,
                        extent: config.extent,
                        projection: 'EPSG:3857'
                    }),
                    controls: olControl.defaults({
                        zoom: false,
                        rotate: false,
                        attribution: false
                    }),
                    interactions: defaults({ mouseWheelZoom: false }).extend([
                        new MouseWheelZoom({
                            condition: platformModifierKeyOnly
                        })
                    ])
                });
            }
        });
    }, []);

    return (
        <>
            <div className={styles.map} ref={mapRef}>
                <div className='controls'>
                    <div className='zoom-controls'>
                        <button
                            type="button"
                            title='Zoom in'
                            className='zoom-controls__button'
                            onClick={() => {
                                const zoom = map.getView().getZoom();
                                if (zoom !== undefined) {
                                    map.getView().animate({
                                        zoom: zoom + 1,
                                        duration: 250
                                    });
                                }
                            }}
                        >
                            +
                        </button>
                        <button
                            type="button"
                            title='Zoom out'
                            className='zoom-controls__button'
                            onClick={() => {
                                const zoom = map.getView().getZoom();
                                if (zoom !== undefined) {
                                    map.getView().animate({
                                        zoom: zoom - 1,
                                        duration: 250
                                    });
                                }
                            }}
                        >
                            –
                        </button>
                    </div>
                    <div className='bottom-controls'>
                        {/* <DateSlider
                            min={new Date(config.slices[0]?.date)}
                            max={new Date(config.slices[config.slices.length]?.date)}
                            layerDate={layerDate}
                            onChange={handleDateChange}
                        /> */}
                    </div>
                </div>
            </div>
        </>
    );
};
