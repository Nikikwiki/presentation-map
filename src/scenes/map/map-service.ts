import OlMap from 'ol/Map';
import axios, { AxiosResponse } from 'axios';
import { Layer, Slice, MapConfig, LayerWithUrl } from 'types';
import { Group as LayerGroup, Tile as TileLayer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { Cluster, OSM, UTFGrid } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {
    Circle, Fill, Stroke, Style, Icon
} from 'ol/style';
import { View } from 'ol';
import * as olControl from 'ol/control';
import { MouseWheelZoom, defaults } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import XYZ from 'ol/source/XYZ';

class MapService {
    public async generateMap(mapConfig: MapConfig, slices: Slice[], mapRef:any): Promise<{
        map: OlMap,
        groups: LayerGroup[]
        groupsCopy: LayerGroup[],
    }> {
        const map = new OlMap({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: mapConfig.center,
                zoom: mapConfig.zoom,
                minZoom: mapConfig.minZoom,
                maxZoom: mapConfig.maxZoom,
                extent: mapConfig.extent,
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

        const groups = await this.createMapGroups(slices);
        const groupsCopy = this.copyLayerGroup(groups);

        groups.forEach((group, i) => {
            if (i === 0) {
                group.setVisible(true);
            }
            map.addLayer(group);
        });
        groupsCopy.forEach(group => {
            group.setVisible(false);
            map.addLayer(group);
        });

        const mapGroups = {
            map, groups, groupsCopy
        };

        return mapGroups;
    }

    private async createMapGroups(slices: Slice[]) {
        let groups: LayerGroup[] = [];

        for (let slice of slices) {
            const vectorTypedLayers = slice.layers.filter((layer: Layer) => layer.type === 'vector');

            const tileTypedLayers = slice.layers.filter((layer: Layer) => layer.type === 'tile');

            const gridTypedLayers = slice.layers.filter((layer: Layer) => layer.type === 'grid');

            const featureConfig: LayerWithUrl[] = [];

            for (let layer of vectorTypedLayers) {
                // eslint-disable-next-line no-await-in-loop
                const { data: layerByUrl } = await this.getLayer(layer.url);

                featureConfig.push({ ...layer, layerByUrl });
            }

            const vectorLayers = [];

            for (let layer of featureConfig) {
                const styles = this.getFeatureStyles(layer);
                const source = this.getFeatureSource(layer);
                const vectorLayer = new VectorLayer({
                    source: source,
                    style: styles
                });
                vectorLayer.set('name', layer.name);
                vectorLayer.set('displayIcon', layer.displayIcon);
                vectorLayer.set('sharedId', layer.sharedId);
                vectorLayers.push(vectorLayer);
            }

            const tileLayers = [];

            for (let layer of tileTypedLayers) {
                const tileLayer = new TileLayer({
                    source: new XYZ({
                        url: layer.url
                    })
                });
                tileLayer.set('name', layer.name);
                tileLayer.set('displayIcon', layer.displayIcon);
                tileLayer.set('sharedId', layer.sharedId);
                tileLayers.push(tileLayer);
            }

            const gridLayers = [];

            for (let layer of gridTypedLayers) {
                const utfGrid = new UTFGrid({
                    tileJSON: {
                        tiles: [ layer.url ],
                        grids: [ layer.url ]
                    }
                });
                utfGrid.set('url', layer.url);
                utfGrid.set('displayIcon', layer.displayIcon);
                utfGrid.set('sharedId', layer.sharedId);
                const a = new TileLayer({
                    source: utfGrid
                });
                gridLayers.push(a);
            }

            const group = new LayerGroup({
                layers: [
                    ...tileLayers,
                    ...gridLayers,
                    ...vectorLayers
                ],
                visible: false
            });

            groups.push(group);
        }

        return groups;
    }

    private getFeatureStyles(layer: LayerWithUrl) {
        let styles;
        if (layer.iconSrc) {
            styles = new Style({
                image: new Icon({
                    src: layer.iconSrc,
                    size: [ layer.iconSize, layer.iconSize ],
                    scale: layer.iconScale
                })
            });
        } else {
            styles = this.generateStyles(layer.strokeColor, layer.strokeWidth, layer.fillColor, layer.width);
        }
        return styles;
    }

    private getFeatureSource(layer: any) {
        let source;
        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(layer.layerByUrl, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });

        if (layer.cluster) {
            source = new Cluster({
                distance: layer.distance,
                source: vectorSource
            });
        } else {
            source = vectorSource;
        }

        return source;
    }

    private async getLayer(url: string): Promise<AxiosResponse<any>> {
        return axios.get(url);
    }

    private generateStyles(strokeColor: number[], strokeWidth: number, fillColor: number[], width: number) {
        return new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({
                color: strokeColor,
                width: width
            }),
            image: new Circle({
                radius: width * 2,
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({
                    color: strokeColor,
                    width: strokeWidth
                })
            })
        });
    }

    private copyLayerGroup(layerGroups: LayerGroup[]): LayerGroup[] {
        const copyLayerGroups = layerGroups.map(layerGr => {
            const lCollection = layerGr.getLayersArray().map(layer => {
                let l: any = {};
                if (layer instanceof TileLayer) {
                    if (layer.getSource() instanceof XYZ) {
                        l = new TileLayer({
                            source: new XYZ({
                                url: layer.getSource().getUrls()[0]
                            })
                        });
                    } else {
                        const utfGrid = new UTFGrid({
                            tileJSON: {
                                tiles: [ layer.getSource().get('url') ],
                                grids: [ layer.getSource().get('url') ]
                            }
                        });
                        utfGrid.set('url', layer.getSource().get('url'));
                        l = new TileLayer({
                            source: utfGrid
                        });
                    }
                } else if (layer instanceof VectorLayer) {
                    if (layer.getSource() instanceof Cluster) {
                        l = new VectorLayer({
                            source: new Cluster({
                                distance: layer.getSource().distance,
                                source: new VectorSource({
                                    features: layer.getSource().getSource().getFeatures()
                                })
                            }),
                            style: layer.getStyle()
                        });
                    } else {
                        l = new VectorLayer({
                            source: new VectorSource({
                                features: layer.getSource().getFeatures()
                            }),
                            style: layer.getStyle()
                        });
                    }
                }
                l.set('name', layer.get('name'));
                l.set('displayIcon', layer.get('displayIcon'));
                l.set('sharedId', layer.get('sharedId'));
                return l;
            });

            return new LayerGroup({
                layers: [ ...lCollection ],
                visible: true
            });
        });

        return copyLayerGroups;
    }
}
export const mapService = new MapService();
