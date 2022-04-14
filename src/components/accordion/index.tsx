import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayerGroup from 'ol/layer/Group';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import styles from './styles.scss';

export const AccordionComponent = (
    { layerGroup, sideGroups }: { layerGroup: LayerGroup, sideGroups: LayerGroup[] }
) => {
    const [ render, setRender ] = useState({});
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
        <div>
            {
                layerGroup?.getLayersArray().find(layer => layer.get('name') && layer.get('displayIcon'))
                && (
                    <Accordion className={styles.accordion}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Легенда</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography component="span" className={styles.legendName}>
                                { layerGroup ? renderContent() : null }
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                )
            }
        </div>
    );
};
