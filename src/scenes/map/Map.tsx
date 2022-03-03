import React, { useEffect, useRef, useState } from 'react';

import OlMap from 'ol/Map';

import 'rc-slider/assets/index.css';
import { MapConfig, Slice } from 'types';
import { DateSlider } from 'components/date-slider';
import LayerGroup from 'ol/layer/Group';

import 'ol-ext/dist/ol-ext.css';
import Swipe from 'ol-ext/control/Swipe';

import { Sidebar } from 'components/sidebar';
import { SwipeGroup } from 'components/swipe-group';
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
    const [ swipeLayerNumber, setSwipeLayerNumber ] = useState<number>(0);
    const [ sliderLayerNumber, setSliderLayerNumber ] = useState<number>(0);
    const [ showLayerDiff, setShowLayerDiff ] = useState<boolean>(false);

    const swipeControl = new Swipe();

    useEffect(() => {
        mapService.generateMap(mapConfig, slices, mapRef).then(res => {
            setMap(res.map);
            setLayerGroups(res.groups);
        });
    }, []);

    const handleDateChange = (value: number) => {
        layerGroups.forEach(group => group.setVisible(false));
        layerGroups[value].setVisible(true);
        setSliderLayerNumber(value);
    };

    const handleSwipeLayerNumberChange = (value: number) => {
        setSwipeLayerNumber(value);
    };

    const showDiff = () => {
        map.addControl(swipeControl);

        layerGroups[sliderLayerNumber].getLayersArray().forEach(layer => {
            swipeControl.addLayer(layer, false);
        });

        layerGroups[swipeLayerNumber].getLayersArray().forEach(layer => {
            swipeControl.addLayer(layer, true);
        });

        layerGroups[swipeLayerNumber].setVisible(true);

        setShowLayerDiff(true);
    };

    const hideDiff = () => {
        swipeControl.removeLayers();
        map.getControls().forEach(control => map.removeControl(control));
        handleDateChange(sliderLayerNumber);

        setShowLayerDiff(false);
    };

    map.on('click', (e) => {
        const feature = map.forEachFeatureAtPixel(e.pixel, (f, _) => {
            return f;
        });
        if (feature) {
            setClickedFeature(feature);
        } else {
            setClickedFeature(null);
        }
    });

    map.on('pointermove', (e) => {
        let hit = map.hasFeatureAtPixel(e.pixel);
        map.getTargetElement().style.cursor = (hit ? 'pointer' : '');
    });

    return (
        <div className={styles.mapWrapper}>
            <div className={styles.map} ref={mapRef}></div>
            <div className={styles.controls}>
                <div className={styles.bottomControls}></div>
                <div className={styles.bottomControls}>
                    <div className={styles.sliderWrapper}>
                        <SwipeGroup
                            slices={slices}
                            onChange={handleSwipeLayerNumberChange}
                        />
                        <DateSlider
                            onChange={handleDateChange}
                            slices={slices}
                        />
                    </div>
                </div>
                <div className={styles.rightControls}>
                    <div className={styles.diffControls}>
                        {
                            showLayerDiff
                                ? (
                                    <button
                                        type='button'
                                        className={styles.diffControlsButton}
                                        onClick={() => hideDiff()}
                                    >
                                        Скрыть различия
                                    </button>
                                )
                                : (
                                    <button
                                        type='button'
                                        className={styles.diffControlsButton}
                                        onClick={() => showDiff()}
                                    >
                                        Показать различия
                                    </button>
                                )
                        }
                    </div>
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
                    <div className={styles.rightControlsContent}></div>
                </div>
            </div>
            <Sidebar feature={clickedFeature?.getProperties()} />
        </div>
    );
};
