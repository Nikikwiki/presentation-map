import React, { useEffect, useRef, useState } from 'react';

import OlMap from 'ol/Map';

import 'rc-slider/assets/index.css';
import { MapConfig, Slice } from 'types';
import { DateSlider } from 'components/date-slider';
import LayerGroup from 'ol/layer/Group';
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

    return (
        <>
            <div className={styles.map} ref={mapRef}>
                <div className='controls'>
                    <div className="bottom-controls"></div>
                    <div className='bottom-controls'>
                        <DateSlider
                            onChange={handleDateChange}
                            slices={slices}
                        />
                    </div>
                    <div className="zoom-controls-wrapper">
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
                    </div>
                </div>
            </div>
        </>
    );
};
