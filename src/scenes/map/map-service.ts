import OlMap from 'ol/Map';
import axios, { AxiosResponse } from 'axios';
import { Layer, Slice, MapConfig } from 'types';
import { Group as LayerGroup, Tile as TileLayer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
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

        const groups = await Promise.resolve(this.createMapGroups(slices));
        const groupsCopy = await Promise.resolve(this.createMapGroups(slices));

        groups.forEach((group, i) => {
            if (i === 0) {
                group.setVisible(true);
            }
            map.addLayer(group);
        });

        groupsCopy.forEach(group => map.addLayer(group));

        const mapGroups = {
            map, groups, groupsCopy
        };

        return mapGroups;
    }

    private async createMapGroups(slices: Slice[]): Promise<LayerGroup[]> {
        const layerGroups = await Promise.all(
            slices.map(async slice => {
                const vectorTypedLayers = slice.layers.filter((layer: Layer) => {
                    if (layer.type === 'vector') {
                        return layer;
                    } else return null;
                });

                const tileTypedLayers = slice.layers.filter((layer: Layer) => {
                    if (layer.type === 'tile') {
                        return layer;
                    } else return null;
                });

                return Promise.all(
                    vectorTypedLayers.map(async (layer) => {
                        const layerByUrl = await this.getLayer(layer.url);
                        return layerByUrl.data;
                    })
                ).then(featuresArray => {
                    const vectorLayers = featuresArray.map(layer => {
                        return (
                            new VectorLayer({
                                source: new VectorSource({
                                    features: new GeoJSON().readFeatures(layer, {
                                        dataProjection: 'EPSG:4326',
                                        featureProjection: 'EPSG:3857'
                                    })
                                }),
                                style: new Style({
                                    image: this.generateCircleStyle()
                                })
                            })
                        );
                    });

                    const tileLayers = tileTypedLayers.map(layer => {
                        return (
                            new TileLayer({
                                source: new XYZ({
                                    url: layer.url
                                })
                            })
                        );
                    });

                    const group = new LayerGroup({
                        layers: [
                            ...tileLayers,
                            ...vectorLayers
                        ],
                        visible: false
                    });
                    return group;
                });
            })
        ).then(res => {
            return res;
        });

        return layerGroups;
    }

    private async getLayer(url: string): Promise<AxiosResponse<any>> {
        return axios.get(url);
    }

    private generateCircleStyle() {
        return new CircleStyle({
            radius: 10,
            fill: new Fill({
                color: this.getRandomColor()
            }),
            stroke: new Stroke({ color: 'yellow', width: 2 })
        });
    }

    private getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
export const mapService = new MapService();
