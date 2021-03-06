import React, { useEffect, useRef, useState } from 'react';

import OlMap from 'ol/Map';

import { MapConfig, Slice } from 'types';
import { DateSlider } from 'components/date-slider';
import LayerGroup from 'ol/layer/Group';

import 'ol-ext/dist/ol-ext.css';
import 'react-pro-sidebar/dist/css/styles.css';
import Swipe from 'ol-ext/control/Swipe';
import { boundingExtent } from 'ol/extent';

import { Sidebar } from 'components/sidebar';
import { AccordionComponent, MobileFeature, MobileLegend } from 'components';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { UTFGrid } from 'ol/source';
import { Group } from 'ol/layer';
import { useMediaQuery } from 'usehooks-ts';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import clsx from 'clsx';
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
    const [ copyLayerGroups, setCopyLayerGroups ] = useState<LayerGroup[]>([]);
    const [ clickedObject, setClickedObject ] = useState<any>({ featureProps: null, layer: null, cluster: [] });
    const [ swipeLayerNumber, setSwipeLayerNumber ] = useState<number>(0);
    const [ sliderLayerNumber, setSliderLayerNumber ] = useState<number>(0);
    const [ showLayerDiff, setShowLayerDiff ] = useState<boolean>(false);

    const mediaMatches = useMediaQuery('(min-width: 666px)');

    const swipeControl = useRef(new Swipe());

    useEffect(() => {
        mapService.generateMap(mapConfig, slices, mapRef).then(res => {
            setMap(res.map);
            setLayerGroups(res.groups);
            setCopyLayerGroups(res.groupsCopy);
        });
    }, []);

    const clickOnUTFGrid = (layerGroup: Group, e: MapBrowserEvent<any>) => {
        const coordinate = map.getEventCoordinate(e.originalEvent);
        const resolution = map.getView().getResolution();
        layerGroup.getLayersArray().forEach(layer => {
            if (layer.getVisible() && layer.getSource() instanceof UTFGrid) {
                layer.getSource().forDataAtCoordinateAndResolution(coordinate, resolution,
                    (data: any) => {
                        if (data !== null && data !== '') {
                            setClickedObject((prev: any) => ({
                                ...prev,
                                layer: layer,
                                featureProps: data,
                                cluster: []
                            }));
                        } else {
                            setClickedObject((prev: any) => ({
                                ...prev,
                                layer: layer,
                                featureProps: null,
                                cluster: []
                            }));
                        }
                    });
            }
        });
    };

    const pointerMoveUTFGrid = (layerGroup: Group, e: MapBrowserEvent<any>) => {
        const coordinate = map.getEventCoordinate(e.originalEvent);
        const resolution = map.getView().getResolution();
        layerGroup.getLayersArray().forEach(layer => {
            if (layer.getVisible() && layer.getSource() instanceof UTFGrid) {
                layer.getSource().forDataAtCoordinateAndResolution(coordinate, resolution,
                    (data: any) => {
                        map.getTargetElement().style.cursor = data ? 'pointer' : '';
                    });
            }
        });
    };

    const setCluster = (features: any[], layer: any) => {
        if (features.length === 1) {
            setClickedObject((prev: any) => ({
                ...prev,
                layer,
                featureProps: features[0].getProperties(),
                cluster: []
            }));
        } else {
            const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
            );
            map.getView().fit(extent, { duration: 1000, padding: [ 50, 50, 50, 50 ] });
            setClickedObject((prev: any) => ({
                ...prev,
                layer,
                featureProps: null,
                cluster: features
            }));
        }
    };

    useEffect(() => {
        const clickListener = (e: MapBrowserEvent<any>) => {
            const featureLayer: any = map.forEachFeatureAtPixel(e.pixel, (f, l) => {
                return { f, l };
            });
            const feature = featureLayer?.f;
            const layer = featureLayer?.l;

            if (feature) {
                if (feature.getProperties().features) {
                    setCluster(feature.getProperties().features, layer);
                } else {
                    setClickedObject((prev: any) => ({
                        ...prev,
                        layer,
                        featureProps: feature.getProperties(),
                        cluster: []
                    }));
                }
            } else {
                if (!showLayerDiff) {
                    clickOnUTFGrid(layerGroups[sliderLayerNumber], e);
                } else {
                    if (e.pixel[0] < document.querySelectorAll('.ol-swipe')[0].getBoundingClientRect().left) {
                        clickOnUTFGrid(layerGroups[sliderLayerNumber], e);
                    } else {
                        clickOnUTFGrid(copyLayerGroups[swipeLayerNumber], e);
                    }
                }
            }
        };

        const pointerMoveListener = (e: MapBrowserEvent<any>) => {
            if (map.hasFeatureAtPixel(e.pixel)) {
                map.getTargetElement().style.cursor = 'pointer';
            } else {
                map.getTargetElement().style.cursor = '';
                if (!showLayerDiff) {
                    pointerMoveUTFGrid(layerGroups[sliderLayerNumber], e);
                } else {
                    const { left } = document.querySelectorAll('.ol-swipe')[0].getBoundingClientRect();
                    if (e.pixel[0] < left) {
                        pointerMoveUTFGrid(layerGroups[sliderLayerNumber], e);
                    } else {
                        pointerMoveUTFGrid(copyLayerGroups[swipeLayerNumber], e);
                    }
                }
            }
        };

        map.on('click', clickListener);
        map.on('pointermove', pointerMoveListener);

        return () => {
            map.un('click', clickListener);
            map.un('pointermove', pointerMoveListener);
        };
    }, [ copyLayerGroups, layerGroups, sliderLayerNumber, swipeLayerNumber, showLayerDiff ]);

    const handleLeftLayerChange = (value: number) => {
        layerGroups.forEach(group => group.setVisible(false));
        if (!showLayerDiff) {
            layerGroups[value].setVisible(true);
        } else {
            swipeControl.current.removeLayers(swipeControl.current.layers.map((swl: any) => swl.layer));
            layerGroups[value].getLayersArray()
                .forEach(layer => swipeControl.current.addLayer(layer, false));
            copyLayerGroups[swipeLayerNumber].getLayersArray()
                .forEach(layer => swipeControl.current.addLayer(layer, true));
            layerGroups[value].setVisible(true);
        }
        setSliderLayerNumber(value);
    };

    const handleRightLayerChange = (value: number) => {
        swipeControl.current.removeLayers(swipeControl.current.layers.map((swl: any) => swl.layer));
        copyLayerGroups.forEach(group => group.setVisible(false));

        layerGroups[sliderLayerNumber].getLayersArray().forEach(layer => swipeControl.current.addLayer(layer, false));
        copyLayerGroups[value].getLayersArray().forEach(layer => swipeControl.current.addLayer(layer, true));
        copyLayerGroups[value].setVisible(true);
        setSwipeLayerNumber(value);
    };

    const showDiff = () => {
        copyLayerGroups[swipeLayerNumber].setVisible(true);

        layerGroups[sliderLayerNumber].getLayersArray().forEach(layer => swipeControl.current.addLayer(layer, false));
        copyLayerGroups[swipeLayerNumber].getLayersArray().forEach(layer => swipeControl.current.addLayer(layer, true));

        map.addControl(swipeControl.current);
        setShowLayerDiff(true);
    };

    const hideDiff = () => {
        layerGroups.forEach(group => group.setVisible(false));
        copyLayerGroups.forEach(group => group.setVisible(false));
        layerGroups[sliderLayerNumber].setVisible(true);
        map.getControls().forEach(control => {
            if (control instanceof Swipe) {
                map.removeControl(control);
            }
        });
        setSwipeLayerNumber(0);
        setShowLayerDiff(false);
    };

    const zoomToObject = (feature: any) => {
        map.getView().fit(feature.getGeometry().getExtent());
        setClickedObject((prev: any) => ({
            ...prev,
            featureProps: feature.getProperties(),
            cluster: []
        }));
    };

    const controlsStyle = clsx({
        [styles.controls]: !showLayerDiff,
        [styles.compareGrid]: showLayerDiff
    });

    return (
        <div className={styles.mapWrapper}>
            <div className={styles.map} ref={mapRef}></div>
            <div className={controlsStyle}>
                <div className={styles.topControls}>
                    {
                        (mapConfig.hasCompare && slices.length > 1) && (
                            <Button
                                type='button'
                                size='large'
                                className={styles.controlButton}
                                onClick={() =>
                                    (showLayerDiff ? hideDiff() : showDiff())}
                                variant="contained"
                            >
                                ????????????????
                            </Button>
                        )
                    }
                </div>
                <div className={styles.zoomControls}>
                    <Button
                        type='button'
                        title='Zoom in'
                        variant='contained'
                        size='large'
                        className='controlButton'
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
                        <AddIcon />
                    </Button>
                    <Button
                        type="button"
                        title='Zoom out'
                        className='controlButton'
                        size='large'
                        variant='contained'
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
                        <RemoveIcon />
                    </Button>
                </div>
                <div className={styles.accodrionWrapper}>
                    <div className={styles.accordionLeft}>
                        {
                            mediaMatches
                                ? (
                                    <AccordionComponent
                                        layerGroup={layerGroups[sliderLayerNumber]}
                                        sideGroups={layerGroups}
                                    />
                                )
                                : (
                                    <MobileLegend
                                        layerGroup={layerGroups[sliderLayerNumber]}
                                        sideGroups={layerGroups}
                                    />
                                )
                        }
                    </div>
                    {
                        showLayerDiff
                    && (
                        <div className={styles.accordionRight}>
                            {
                                mediaMatches ? (
                                    <AccordionComponent
                                        layerGroup={copyLayerGroups[swipeLayerNumber]}
                                        sideGroups={copyLayerGroups}
                                    />
                                ) : (
                                    <MobileLegend
                                        layerGroup={copyLayerGroups[swipeLayerNumber]}
                                        sideGroups={copyLayerGroups}
                                    />
                                )
                            }
                        </div>
                    )
                    }
                </div>
                {
                    slices.length > 1
                            && (
                                <div className={styles.sliderWrapper}>
                                    <DateSlider
                                        onChange={handleLeftLayerChange}
                                        slices={slices}
                                    />
                                    {
                                        showLayerDiff && (
                                            <DateSlider
                                                onChange={handleRightLayerChange}
                                                slices={slices}
                                            />
                                        )
                                    }
                                </div>
                            )
                }
            </div>
            {
                mediaMatches
                    ? (
                        <Sidebar
                            clickedObject={clickedObject}
                            onClose={() => {
                                setClickedObject((prev: any) => ({
                                    ...prev,
                                    featureProps: null,
                                    cluster: []
                                }));
                            }}
                            zoomToObject={(feature: any) => zoomToObject(feature)}
                        />
                    )
                    : (
                        <MobileFeature
                            clickedObject={clickedObject}
                            onClose={() => {
                                setClickedObject((prev: any) => ({
                                    ...prev,
                                    featureProps: null,
                                    cluster: []
                                }));
                            }}
                        />
                    )
            }
        </div>
    );
};
