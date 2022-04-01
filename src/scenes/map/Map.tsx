import React, { useEffect, useRef, useState } from 'react';

import OlMap from 'ol/Map';

import { MapConfig, Slice } from 'types';
import { DateSlider } from 'components/date-slider';
import LayerGroup from 'ol/layer/Group';

import 'ol-ext/dist/ol-ext.css';
import 'react-pro-sidebar/dist/css/styles.css';
import Swipe from 'ol-ext/control/Swipe';

import { Sidebar } from 'components/sidebar';
import { AccordionComponent, MobileLegend } from 'components';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { UTFGrid } from 'ol/source';
import { Group } from 'ol/layer';
import { useMediaQuery } from 'usehooks-ts';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
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
    const [ clickedFeature, setClickedFeature ] = useState<any>(null);
    const [ swipeLayerNumber, setSwipeLayerNumber ] = useState<number>(0);
    const [ sliderLayerNumber, setSliderLayerNumber ] = useState<number>(0);
    const [ showLayerDiff, setShowLayerDiff ] = useState<boolean>(false);
    const [ leftMobileLegend, setLeftMobileLegend ] = useState<any>(null);

    const mediaMatches = useMediaQuery('(min-width: 650px)');

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
            if (layer.getSource() instanceof UTFGrid) {
                layer.getSource().forDataAtCoordinateAndResolution(coordinate, resolution,
                    (data: any) => {
                        if (data !== null && data !== '') {
                            setClickedFeature(data);
                        } else setClickedFeature(null);
                    });
            }
        });
    };

    const pointerMoveUTFGrid = (layerGroup: Group, e: MapBrowserEvent<any>) => {
        const coordinate = map.getEventCoordinate(e.originalEvent);
        const resolution = map.getView().getResolution();
        layerGroup.getLayersArray().forEach(layer => {
            if (layer.getSource() instanceof UTFGrid) {
                layer.getSource().forDataAtCoordinateAndResolution(coordinate, resolution,
                    (data: any) => {
                        map.getTargetElement().style.cursor = data ? 'pointer' : '';
                    });
            }
        });
    };

    useEffect(() => {
        const clickListener = (e: MapBrowserEvent<any>) => {
            const feature = map.forEachFeatureAtPixel(e.pixel, (f) => {
                return f;
            });
            // TODO реализовать логику отображения кластера
            if (feature) {
                if (feature.getProperties().features) {
                    if (feature.getProperties().features.length === 1) {
                        setClickedFeature(feature.getProperties().features[0]);
                    } else {
                        setClickedFeature({
                            type: 'это кластер'
                        });
                    }
                } else {
                    setClickedFeature(feature.getProperties());
                }
            } else {
                setClickedFeature(null);
                if (!showLayerDiff) {
                    clickOnUTFGrid(layerGroups[sliderLayerNumber], e);
                } else {
                    const { left } = document.querySelectorAll('.ol-swipe')[0].getBoundingClientRect();
                    if (e.pixel[0] < left) {
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

    return (
        <div className={styles.mapWrapper}>
            <div className={styles.map} ref={mapRef}></div>
            <div className={styles.controls}>
                <div className={styles.topControls}>
                    {
                        mapConfig.hasCompare && (
                            <Button
                                type='button'
                                size='large'
                                className={styles.controlButton}
                                onClick={() =>
                                    (showLayerDiff ? hideDiff() : showDiff())}
                                variant="contained"
                            >
                                Сравнить
                            </Button>
                        )
                    }
                </div>
                <div className={styles.midControls}>
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
                </div>
                <div className={styles.bottomControls}>
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
                        <div className={styles.accordionRight}>
                            {
                                showLayerDiff && (
                                    mediaMatches ? (
                                        <AccordionComponent
                                            layerGroup={copyLayerGroups[swipeLayerNumber]}
                                            sideGroups={copyLayerGroups}
                                        />
                                    ) : (
                                        <Button
                                            size='large'
                                            variant="contained"
                                            className={styles.controlButton}
                                        >
                                            Легенда
                                        </Button>
                                    )
                                )
                            }
                        </div>
                    </div>
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
                </div>
            </div>
            <Sidebar
                feature={clickedFeature}
                onClose={() => {
                    setClickedFeature(null);
                }}
            />
            {/* <MobileLegend
                layerGroup={leftMobileLegend?.layerGroup}
                sideGroups={leftMobileLegend?.sideGroups}
                onClose={() => {
                    setLeftMobileLegend(null);
                }}
            /> */}
        </div>
    );
};
