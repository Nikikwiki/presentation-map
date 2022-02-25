import React, { useEffect, useState } from 'react';
import { ProSidebar, SidebarHeader, SidebarContent, SidebarFooter } from 'react-pro-sidebar';

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

    return (
        <div>
            {
                feature
                    ? (
                        <ProSidebar collapsed={sidebarCollapse} collapsedWidth='0px'>
                            <SidebarHeader>
                                {feature.mr}
                            </SidebarHeader>
                            <SidebarContent>
                                {feature.string}
                                ,
                                {feature.title}
                                ,
                                {feature.type}
                            </SidebarContent>
                            <SidebarFooter>
                                Footer
                            </SidebarFooter>
                        </ProSidebar>
                    ) : null
            }
        </div>
    );
};
