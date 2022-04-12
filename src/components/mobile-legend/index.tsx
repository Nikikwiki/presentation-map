import React, { useEffect, useState } from 'react';
import {
    Button,
    Checkbox, Divider, Drawer, FormControlLabel, FormGroup, IconButton
} from '@mui/material';
import LayerGroup from 'ol/layer/Group';
import CloseIcon from '@mui/icons-material/Close';

import styles from './styles.scss';

interface MobileLegendProps {
    layerGroup: LayerGroup,
    sideGroups: LayerGroup[]
}

export const MobileLegend = (props: MobileLegendProps) => {
    const [ showLegend, setShowLegend ] = useState(false);
    const [ render, setRender ] = useState({});

    const { layerGroup, sideGroups } = props;

    const hideSidebar = () => {
        setShowLegend(false);
    };

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                hideSidebar();
            }
        };

        document.addEventListener('keydown', listener);

        return () => {
            document.removeEventListener('keydown', listener);
        };
    }, []);

    const checkLayer = (e: any, layer: any) => {
        const sharedId = layer.get('sharedId');
        if (e.target.checked) {
            layer.setVisible(true);
            sideGroups.forEach(group => {
                group.getLayersArray().forEach(l => {
                    if (sharedId && l.get('sharedId') === sharedId) {
                        l.setVisible(true);
                    }
                });
            });
        } else {
            layer.setVisible(false);
            sideGroups.forEach(group => {
                group.getLayersArray().forEach(l => {
                    if (sharedId && l.get('sharedId') === sharedId) {
                        l.setVisible(false);
                    }
                });
            });
        }

        setRender({});
    };

    const renderContent = () => {
        return (
            <FormGroup>
                {
                    layerGroup.getLayersArray().map((layer, i) => {
                        if (layer.get('name') && layer.get('displayIcon')) {
                            return (
                                <FormControlLabel
                                    key={i.toString()}
                                    control={(
                                        <Checkbox
                                            checked={layer.getVisible()}
                                            onChange={(e) => checkLayer(e, layer)}
                                        />
                                    )}
                                    label={(
                                        <div className={styles.label}>
                                            <div
                                                className={styles.lableIcon}
                                                style={{ backgroundImage: `url(${layer.get('displayIcon')})` }}
                                            >
                                            </div>
                                            <span>
                                                {layer.get('name')}
                                            </span>
                                        </div>
                                    )}
                                />
                            );
                        } else return null;
                    })
                }
            </FormGroup>
        );
    };

    return (
        <div className={styles.controlButton}>
            {
                layerGroup?.getLayersArray().find(layer => layer.get('name') && layer.get('displayIcon'))
            && (
                <Button
                    variant="contained"
                    size='large'
                    className={styles.controlButton}
                    onClick={() => setShowLegend(true)}
                >
                    Легенда
                </Button>
            )
            }
            <Drawer
                anchor='bottom'
                open={showLegend}
                variant="persistent"
            >
                <div className='header'>
                    <strong>Легенда</strong>
                    <IconButton
                        aria-label='close'
                        color='primary'
                        onClick={() => hideSidebar()}
                        size='large'
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <Divider />
                <div className={styles.body}>
                    {layerGroup && renderContent()}
                </div>
            </Drawer>
        </div>
    );
};
