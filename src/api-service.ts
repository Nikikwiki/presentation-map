import axios, { AxiosResponse } from 'axios';
import { ConfigType } from './types';

class ApiService {
    private configUrl = 'config.json';

    async getConfig(): Promise<AxiosResponse<ConfigType>> {
        return axios.get(this.configUrl);
    }
}

export const apiService = new ApiService();
