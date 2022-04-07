import React, { useEffect, useState } from 'react';
import { Divider, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import styles from './styles.scss';

export const MobileFeature = (props: any) => {
    const { clickedObject, onClose } = props;
    const [ sidebarCollapse, setSidebarCollapse ] = useState<boolean>(true);

    useEffect(() => {
        if (clickedObject.featureProps) {
            setSidebarCollapse(false);
        } else {
            setSidebarCollapse(true);
        }
    });

    const hideSidebar = () => {
        setSidebarCollapse(true);
        onClose();
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

    const renderContent = () => {
        if (clickedObject.featureProps) {
            return Object.entries(clickedObject.featureProps).map(([ key, value ], i) => {
                if (typeof (value) === 'string') {
                    return (
                        <div key={i.toString()} className={styles.contentBlock}>
                            <div className={styles.contentTitle}>{key}</div>
                            <div className={styles.contentStyle}>{value}</div>
                        </div>
                    );
                } else {
                    return null;
                }
            });
        } else {
            return null;
        }
    };

    return (
        <div className={styles.controlButton}>
            <Drawer
                anchor='bottom'
                open={!sidebarCollapse}
                variant="persistent"
            >
                <div className='header'>
                    <strong>{clickedObject.layer?.get('name')}</strong>
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
                    {renderContent()}
                </div>
            </Drawer>
        </div>
    );
};
