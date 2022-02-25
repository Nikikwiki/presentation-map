import * as React from 'react';

export const createSvgIcon = (
    Icon: React.ElementType<React.SVGProps<SVGSVGElement>>,
    additional_props: React.SVGProps<SVGSVGElement> = {}
) => (props: React.SVGProps<SVGSVGElement>) => (
    <Icon
        {...props}
        {...additional_props}
    />
);
