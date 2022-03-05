import React, { useEffect, useState } from 'react';
import { ProSidebar, SidebarHeader, SidebarContent, SidebarFooter } from 'react-pro-sidebar';
import { Icons } from 'components/icons';
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
        <div className={styles.sidebarWrapper}>
            <ProSidebar
                className={styles.sidebar}
                collapsed={sidebarCollapse}
                collapsedWidth='0px'
            >
                <SidebarHeader className={styles.header}>
                    <p className={styles.headerText}>
                        {feature?.mr}
                    </p>
                    <button
                        className={styles.headerButton}
                        type='button'
                        onClick={() => hideSidebar()}
                    >
                        <Icons.IconClose className={styles.icon} />
                    </button>
                </SidebarHeader>
                <SidebarContent>
                    {
                        renderContent()
                    }
                </SidebarContent>
            </ProSidebar>
        </div>
    );
};
