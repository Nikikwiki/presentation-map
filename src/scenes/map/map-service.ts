import OlMap from 'ol/Map';
import axios, { AxiosResponse } from 'axios';
import { Layer, Slice, MapConfig, LayerWithUrl } from 'types';
import { Group as LayerGroup, Tile as TileLayer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { Cluster, OSM, UTFGrid } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {
    Circle, Fill, Stroke, Style, Icon, Text
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
            const layers: LayerWithUrl[] = [];

            for (let layer of slice.layers) {
                if (layer.url) {
                    // eslint-disable-next-line no-await-in-loop
                    const { data: layerByUrl } = await this.getLayer(layer.url);
                    layers.push({ ...layer, layerByUrl });
                } else {
                    const layerByUrl = '';
                    layers.push({ ...layer, layerByUrl });
                }
            }

            let mapLayers = [];
            const styleCache: any = {};
            for (let layer of layers) {
                let sharedLayer = null;

                switch (layer.type) {
                    case 'vector':
                        sharedLayer = this.createVectorLayer(layer, styleCache);
                        break;
                    case 'tile':
                        sharedLayer = this.createTileLayer(layer);
                        break;
                    case 'grid':
                        sharedLayer = this.createGridLayer(layer);
                        break;
                    case 'legend':
                        sharedLayer = this.createEmptyLayer();
                        break;
                    default: {
                        sharedLayer = this.createEmptyLayer();
                    }
                }

                sharedLayer.set('url', layer.url);
                sharedLayer.set('displayIcon', layer.displayIcon);
                sharedLayer.set('sharedId', layer.sharedId);
                sharedLayer.set('name', layer.name);

                mapLayers.push(sharedLayer);
            }

            const group = new LayerGroup({
                layers: mapLayers,
                visible: false
            });

            groups.push(group);
        }

        return groups;
    }

    private createVectorLayer(layer: LayerWithUrl, styleCache: any) {
        const source = this.getFeatureSource(layer);
        const vectorLayer = new VectorLayer({
            source: source,
            style: (feature) => {
                const size = feature.get('features')?.length;
                let styles = styleCache[size];
                if (!styles) {
                    styles = this.getFeatureStyles(layer, size);
                }
                return styles;
            }
        });

        return vectorLayer;
    }

    private createTileLayer(layer: LayerWithUrl) {
        const tileLayer = new TileLayer({
            source: new XYZ({
                url: layer.url
            })
        });
        return tileLayer;
    }

    private createEmptyLayer() {
        const tileLayer = new TileLayer({
            source: new XYZ({
                url: undefined
            })
        });
        return tileLayer;
    }

    private createGridLayer(layer: LayerWithUrl) {
        const utfGrid = new UTFGrid({
            tileJSON: {
                tiles: [ layer.url ],
                grids: [ layer.url ]
            }
        });
        return new TileLayer({
            source: utfGrid
        });
    }

    private getFeatureStyles(layer: LayerWithUrl, size: any) {
        // eslint-disable-next-line no-param-reassign
        size = size > 1 && layer.text ? size : null;
        let styles;
        if (layer.iconSrc) {
            styles = new Style({
                image: new Icon({
                    src: layer.iconSrc,
                    size: layer.iconSize ? [ layer.iconSize, layer.iconSize ] : undefined,
                    scale: layer.iconScale ? layer.iconScale : 1
                }),
                text: new Text({
                    text: size?.toString(),
                    fill: new Fill({
                        color: layer.fillText
                    }),
                    offsetX: layer.offsetXText,
                    offsetY: layer.offsetYText,
                    scale: layer.scaleText
                })
            });
        } else {
            styles = this.generateStyles(layer, size);
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

    private generateStyles(layer: LayerWithUrl, size: number) {
        const { strokeColor, strokeWidth, fillColor, width } = layer;
        return new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({
                color: strokeColor,
                width: width || 7
            }),
            image: new Circle({
                radius: (width || 7) * 2,
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({
                    color: strokeColor,
                    width: strokeWidth
                })
            }),
            text: new Text({
                text: size?.toString(),
                fill: new Fill({
                    color: layer.fillText
                }),
                offsetX: layer.offsetXText,
                offsetY: layer.offsetYText,
                scale: layer.scaleText
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
                                url: layer.getSource().getUrls() ? layer.getSource().getUrls()[0] : ''
                            })
                        });
                    } else {
                        const utfGrid = new UTFGrid({
                            tileJSON: {
                                tiles: [ layer.get('url') ],
                                grids: [ layer.get('url') ]
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
