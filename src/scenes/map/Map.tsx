import React, { useEffect, useRef } from 'react';

import * as olControl from 'ol/control';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { MouseWheelZoom, defaults } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';

import styles from './styles.scss';

export const MapComponent = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    let map: OlMap = new OlMap({});

    useEffect(() => {
        if (mapRef.current) {
            map = new OlMap({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM()
                    })
                ],
                view: new View({
                    center: [ 0, 0 ],
                    zoom: 3,
                    minZoom: 6,
                    maxZoom: 20,
                    extent: [
                        4014887.303085567,
                        7253866.886876604,
                        4047197.82249679,
                        7276183.96682681
                    ]
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
                                console.log(map.getView().calculateExtent());
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
                </div>
            </div>
        </>
    );
};
