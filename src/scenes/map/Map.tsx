import React, { useEffect, useRef, useState } from 'react';

import OlMap from 'ol/Map';

import 'rc-slider/assets/index.css';
import { MapConfig, Slice } from 'types';
import { DateSlider } from 'components/date-slider';
import LayerGroup from 'ol/layer/Group';

import { Sidebar } from 'components/sidebar';
import styles from './styles.scss';
import { mapService } from './map-service';

interface MapComponentProps {
    mapConfig: MapConfig;
    slices: Slice[];
}

export const MapComponent = (props: MapComponentProps) => {
    const { mapConfig, slices } = props;
    const mapRef = useRef<any>();
    const [ map, setMap ] = useState(new OlMap({}));
    const [ layerGroups, setLayerGroups ] = useState<LayerGroup[]>([]);
    const [ clickedFeature, setClickedFeature ] = useState<any>(null);

    useEffect(() => {
        mapService.generateMap(mapConfig, slices, mapRef).then(res => {
            setMap(res.map);
            setLayerGroups(res.groups);
        });
    }, []);

    const handleDateChange = (value: number) => {
        layerGroups.forEach(group => group.setVisible(false));
        layerGroups[value].setVisible(true);
    };

    map.on('click', (e) => {
        const feature = map.forEachFeatureAtPixel(e.pixel, (f, layer) => {
            return f;
        });
        if (feature) {
            setClickedFeature(feature);
        } else {
            setClickedFeature(null);
        }
    });

    return (
        <div className={styles.mapWrapper}>
            <div className={styles.map} ref={mapRef}></div>
            <div className={styles.controls}>
                <div className={styles.bottomControls}></div>
                <div className={styles.bottomControls}>
                    <DateSlider
                        onChange={handleDateChange}
                        slices={slices}
                    />
                </div>
                <div className={styles.zoomControlsWrapper}>
                    <div className={styles.zoomControls}>
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
                </div>
            </div>
            <Sidebar feature={clickedFeature?.getProperties()} />
        </div>
    );
};
