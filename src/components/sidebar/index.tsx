import React, { useEffect, useState } from 'react';
import { ProSidebar, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import styles from './styles.scss';

export const Sidebar = (props: any) => {
    const [ sidebarCollapse, setSidebarCollapse ] = useState<boolean>(true);

    const { feature } = props;

    useEffect(() => {
        if (feature) {
            setSidebarCollapse(false);
        } else {
            setSidebarCollapse(true);
        }
    }, [ feature ]);

    const renderContent = () => {
        if (feature) {
            const a = Object.entries(feature).map(([ key, value ], i) => {
                if (typeof (value) === 'string') {
                    return (
                        <div key={i.toString()}>
                            {key}
                            :
                            {' '}
                            {value}
                        </div>
                    );
                } else {
                    return null;
                }
            });
            return a;
        } else {
            return null;
        }
    };

    return (
        <div className={styles.sidebarWrapper}>
            <ProSidebar collapsed={sidebarCollapse} collapsedWidth='0px'>
                <SidebarHeader className={styles.header}>
                    {feature?.mr}
                </SidebarHeader>
                <SidebarContent className={styles.content}>
                    {
                        renderContent()
                    }
                </SidebarContent>
            </ProSidebar>
        </div>
    );
};
