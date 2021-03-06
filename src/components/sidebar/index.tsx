import React, { useEffect, useState } from 'react';
import { Button, Divider, Drawer, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import styles from './styles.scss';

export const Sidebar = (props: any) => {
    const [ sidebarCollapse, setSidebarCollapse ] = useState<boolean>(true);

    const { clickedObject, onClose, zoomToObject } = props;

    useEffect(() => {
        if (clickedObject.featureProps || clickedObject.cluster.length) {
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
                } else return null;
            });
        } else {
            return null;
        }
    };

    const renderClusterContent = () => {
        if (clickedObject.cluster.length) {
            return clickedObject.cluster.map((feature: any, i: number) => {
                return (
                    <div
                        key={i.toString()}
                    >
                        <Button
                            variant='text'
                            className={styles.clusterBlock}
                            onClick={() => zoomToObject(feature)}
                        >
                            {feature.getProperties()?.title}
                            <br />
                            {feature.getProperties()?.string}
                        </Button>
                        <Divider />
                    </div>
                );
            });
        } else return null;
    };

    const renderHeader = () => {
        return (
            <div className={styles.header}>
                <p className={styles.headerText}>
                    {clickedObject.layer.get('name')}
                </p>
                <IconButton
                    aria-label='close'
                    color='primary'
                    onClick={() => hideSidebar()}
                    size='large'
                >
                    <ChevronLeftIcon />
                </IconButton>
            </div>
        );
    };

    return (
        <Drawer
            anchor='left'
            open={!sidebarCollapse}
            variant="persistent"
            sx={{
                width: '20vw',
                minWidth: '260px',
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: '20vw',
                    minWidth: '260px',
                    boxSizing: 'border-box'
                }
            }}
        >
            {(clickedObject.featureProps || clickedObject.cluster.length) && renderHeader()}
            <Divider />
            {
                clickedObject.featureProps && (
                    <div className={styles.body}>
                        {renderContent()}
                    </div>
                )
            }
            {
                clickedObject.cluster.length > 0 && (
                    <div className={styles.clsuterBody}>
                        {renderClusterContent()}
                    </div>
                )
            }
        </Drawer>
    );
};
