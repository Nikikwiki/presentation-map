import React, { useEffect, useState } from 'react';
import { ProSidebar, SidebarHeader, SidebarContent, SidebarFooter } from 'react-pro-sidebar';
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

    const hideSidebar = () => {
        setSidebarCollapse(true);
    };

    const renderContent = () => {
        if (feature) {
            return Object.entries(feature).map(([ key, value ], i) => {
                if (typeof (value) === 'string') {
                    return (
                        <div key={i.toString()} className={styles.contentBlock}>
                            <span className={styles.contentTitle}>{key}</span>
                            :
                            {' '}
                            {value}
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
                <SidebarFooter className={styles.footer}>
                    <button
                        type='button'
                        className={styles.footerButton}
                        onClick={() => hideSidebar()}
                    >
                        Свернуть
                    </button>
                </SidebarFooter>
            </ProSidebar>
        </div>
    );
};
