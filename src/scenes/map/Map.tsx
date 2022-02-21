import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import * as olControl from 'ol/control';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { MouseWheelZoom, defaults } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';

import 'rc-slider/assets/index.css';
import { ConfigType } from 'types';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { DateSlider } from 'components/date-slider';
import styles from './styles.scss';

interface MapComponentProps {
    configState: ConfigType;
}

export const MapComponent = (props: MapComponentProps) => {
    const { configState } = props;

    const mapRef = useRef<any>();

    let map: OlMap = new OlMap({});

    const image = new CircleStyle({
        radius: 10,
        fill: new Fill({
            color: '#FF9000'
        }),
        stroke: new Stroke({ color: 'yellow', width: 2 })
    });

    useEffect(() => {
        map = new OlMap({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                ...configState.slices.map((slice, i) => {
                    return (
                        new VectorLayer({
                            source: new VectorSource({
                                features: new GeoJSON().readFeatures(slice, {
                                    dataProjection: 'EPSG:4326',
                                    featureProjection: 'EPSG:3857'
                                })
                            }),
                            style: new Style({
                                image: image
                            }),
                            visible: i === 0
                        })
                    );
                })
            ],
            view: new View({
                center: configState.center,
                zoom: configState.zoom,
                minZoom: configState.minZoom,
                maxZoom: configState.maxZoom,
                extent: configState.extent,
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
    }, []);

    const handleDateChange = (value: number) => {
        map.getLayers().forEach((layer, i) => {
            if (
                Object.getPrototypeOf(layer).constructor.name !== 'TileLayer'
            ) {
                if (value === (i - 1)) {
                    layer.setVisible(true);
                } else {
                    layer.setVisible(false);
                }
            }
        });
    };

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
                        <DateSlider
                            onChange={handleDateChange}
                            slices={configState.slices}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
