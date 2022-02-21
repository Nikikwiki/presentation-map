import { apiService } from 'api-service';
import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { ConfigType } from 'types';
import { Map } from './map';

export const RootScene: React.FC<any> = (): JSX.Element => {
    const [ configState, setConfigState ] = useState<ConfigType>(
        {
            center: [],
            zoom: 0,
            minZoom: 0,
            maxZoom: 0,
            extent: [],
            slices: []
        }
    );

    useEffect(() => {
        apiService.getConfig().then((res:AxiosResponse<ConfigType>) => {
            setConfigState(res.data);
        });
    }, []);

    return (
        <>
            {
                configState.slices.length > 0 ? (
                    <Map configState={configState} />
                ) : null
            }
        </>
    );
};
