import axios, { AxiosResponse } from 'axios';
import { Layer, Slice } from 'types';
import { Group as LayerGroup, Tile as TileLayer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { TileImage, TileJSON } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'geojson';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

class MapService {
    public createMapGroups = (slices: Slice[]): void => {
        slices.map(slice => {
            const vectorTypedLayers = slice.layers.filter((layer: Layer) => {
                if (layer.type === 'vector') {
                    return layer;
                } else return null;
            });

            Promise.all(
                vectorTypedLayers.map(async (layer) => {
                    const a = await this.getLayer(layer.url);
                    return a.data;
                })
            ).then(featuresArray => {
                console.log(featuresArray);
            });
        });
    };

    private async getLayer(url: string): Promise<AxiosResponse<any>> {
        return axios.get(url);
    }
}
export const mapService = new MapService();
