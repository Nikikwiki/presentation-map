import React, { useEffect, useRef, useState } from 'react';

import OlMap from 'ol/Map';

import 'rc-slider/assets/index.css';
import { MapConfig, Slice } from 'types';
import { DateSlider } from 'components/date-slider';
import LayerGroup from 'ol/layer/Group';

import 'ol-ext/dist/ol-ext.css';
import Swipe from 'ol-ext/control/Swipe';

import { Sidebar } from 'components/sidebar';
import { Layer, Group } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'geojson';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style } from 'ol/style';
import { mapService } from './map-service';
import styles from './styles.scss';

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

    const clearControls = () => {
        map.getControls().forEach(control => map.removeControl(control));
        swipeControl.removeLayers();
        layerGroups.forEach(group => group.setVisible(false));
    };

    const copyLayerGroup = (layerGr: Group): Group => {
        const lCollection = layerGr.getLayersArray().map(layer => {
            let l: any = {};
            if (layer instanceof TileLayer) {
                l = new TileLayer({
                    source: new XYZ({
                        url: layer.getSource().url
                    })
                });
            } else if (layer instanceof VectorLayer) {
                l = new VectorLayer({
                    source: new VectorSource({
                        features: layer.getSource().getFeatures()
                    }),
                    style: layer.getStyle()
                });
            }
            return l;
        });

        const lGroup = new Group({
            layers: [ ...lCollection ],
            visible: true
        });

        return lGroup;
    };

    const handleLeftLayerChange = (value: number) => {
        if (!showLayerDiff) {
            layerGroups.forEach(group => group.setVisible(false));
            layerGroups[value].setVisible(true);
            setSliderLayerNumber(value);
        } else {
            clearControls();
            map.addControl(swipeControl);
            if (swipeLayerNumber !== value) {
                layerGroups[value].getLayersArray().forEach(layer => {
                    swipeControl.addLayer(layer, false);
                });
                layerGroups[swipeLayerNumber].getLayersArray().forEach(layer => {
                    swipeControl.addLayer(layer, true);
                });
                layerGroups[swipeLayerNumber].setVisible(true);
                layerGroups[value].setVisible(true);
            } else {
                layerGroups[value].setVisible(true);
            }
            setSliderLayerNumber(value);
        }
    };

    const handleRightLayerChange = (value: number) => {
        layerGroups.forEach(group => group.setVisible(false));
        layerGroups.forEach(group => map.removeLayer(group));
        swipeControl.removeLayers(swipeControl.layers.map((swl: any) => swl.layer));
        layerGroups[sliderLayerNumber].getLayersArray().forEach(layer => {
            swipeControl.addLayer(layer, false);
        });
        if (value === sliderLayerNumber) {
            const lGroup = copyLayerGroup(layerGroups[sliderLayerNumber]);
            map.addLayer(lGroup);
            lGroup.getLayersArray().forEach(layer => {
                swipeControl.addLayer(layer, true);
            });
        } else {
            map.addLayer(layerGroups[value]);
            layerGroups[value].getLayersArray().forEach(layer => {
                swipeControl.addLayer(layer, true);
            });
            layerGroups[value].setVisible(true);
        }
        map.addLayer(layerGroups[sliderLayerNumber]);
        layerGroups[sliderLayerNumber].setVisible(true);
        setSwipeLayerNumber(value);
    };

    const showDiff = () => {
        layerGroups.forEach(group => map.removeLayer(group));
        swipeControl.removeLayers(swipeControl.layers.map((swl: any) => swl.layer));
        map.addLayer(layerGroups[sliderLayerNumber]);
        layerGroups[sliderLayerNumber].getLayersArray().forEach(layer => {
            swipeControl.addLayer(layer, false);
        });
        if (swipeLayerNumber === sliderLayerNumber) {
            const lGroup = copyLayerGroup(layerGroups[sliderLayerNumber]);
            map.addLayer(lGroup);
            lGroup.getLayersArray().forEach(layer => {
                swipeControl.addLayer(layer, true);
            });
            console.log(layerGroups);
            setLayerGroups([ ...layerGroups, lGroup ]);
        } else {
            map.addLayer(layerGroups[swipeLayerNumber]);
            layerGroups[swipeLayerNumber].getLayersArray().forEach(layer => {
                swipeControl.addLayer(layer, true);
            });
            layerGroups[swipeLayerNumber].setVisible(true);
        }

        map.addControl(swipeControl);
        setShowLayerDiff(true);
    };

    const hideDiff = () => {
        layerGroups.forEach(group => map.removeLayer(group));
        swipeControl.removeLayers();
        map.getControls().forEach(control => {
            map.removeControl(control);
        });
        layerGroups.forEach(group => map.addLayer(group));
        layerGroups.forEach(group => group.setVisible(false));
        layerGroups[sliderLayerNumber].setVisible(true);
        setSwipeLayerNumber(0);
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
                <div className={styles.topControls}>
                    <button
                        type='button'
                        className={styles.controlButton}
                        onClick={() =>
                            (showLayerDiff ? hideDiff() : showDiff())}
                    >
                        Сравнить
                    </button>
                </div>
                <div className={styles.midControls}>
                    <div className={styles.zoomControls}>
                        <button
                            type="button"
                            title='Zoom in'
                            className='zoom-controls__button controlButton top'
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
                            className='zoom-controls__button controlButton bottom'
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
                <div className={styles.bottomControls}>
                    <div className={styles.sliderWrapper}>
                        <DateSlider
                            onChange={handleLeftLayerChange}
                            slices={slices}
                        />
                        {
                            showLayerDiff
                                ? (
                                    <DateSlider
                                        onChange={handleRightLayerChange}
                                        slices={slices}
                                    />
                                ) : null

                        }
                    </div>
                </div>
            </div>
            <Sidebar
                feature={clickedFeature?.getProperties()}
                onClose={() => {
                    setClickedFeature(null);
                }}
            />
        </div>
    );
};
