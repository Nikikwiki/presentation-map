import axios, { AxiosResponse } from 'axios';
import { MapConfig, Slice } from './types';

class ApiService {
    private mapConfigUrl = 'map-config.json';
    private slicesUrl = 'slices.json';

    public async getMapConfig(): Promise<AxiosResponse<MapConfig>> {
        return axios.get(this.mapConfigUrl);
    }

    public async getSlices(): Promise<AxiosResponse<Slice[]>> {
        return axios.get(this.slicesUrl);
    }
}

export const apiService = new ApiService();
