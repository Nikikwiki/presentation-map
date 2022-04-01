import { apiService } from 'api-service';
import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { MapConfig, Slice } from 'types';
import { Map } from './map';

export const RootScene: React.FC<any> = (): JSX.Element => {
    const [ mapConfigState, setMapConfigState ] = useState<MapConfig>(
        {
            center: [],
            zoom: 0,
            minZoom: 0,
            maxZoom: 0,
            extent: [],
            hasCompare: false
        }
    );

    const [ slices, setSlices ] = useState<Slice[]>([]);

    useEffect(() => {
        Promise.all([
            apiService.getMapConfig(),
            apiService.getSlices()
        ]).then((res: AxiosResponse<any>[]) => {
            setMapConfigState(res[0].data);
            setSlices(res[1].data);
        });
    }, []);

    return (
        <>
            {
                mapConfigState.zoom > 0 && slices.length > 0
                    ? <Map mapConfig={mapConfigState} slices={slices} />
                    : null
            }
        </>
    );
};
