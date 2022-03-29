import Typography from '@mui/material/Typography';
import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayerGroup from 'ol/layer/Group';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import styles from './styles.scss';

export const AccordionComponent = ({ layerGroup }: { layerGroup: LayerGroup }) => {
    const checkLayer = (e: any, layer: any) => {
        if (e.target.checked) {
            layer.setVisible(true);
        } else {
            layer.setVisible(false);
        }
    };

    const renderContent = () => {
        return (
            <FormGroup>
                {
                    layerGroup.getLayersArray().map((layer, i) => {
                        if (layer.get('name')) {
                            return (
                                <FormControlLabel
                                    key={i.toString()}
                                    control={(
                                        <Checkbox
                                            defaultChecked
                                            onChange={(e) => checkLayer(e, layer)}
                                        />
                                    )}
                                    label={layer.get('name')}
                                />
                            );
                        } else return null;
                    })
                }
            </FormGroup>
        );
    };

    return (
        <Accordion className={styles.accordion}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>Легенда</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography component="span">
                    { layerGroup ? renderContent() : null }
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};
