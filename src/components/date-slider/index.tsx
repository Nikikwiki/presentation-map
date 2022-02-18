import Slider, { SliderTooltip } from 'rc-slider';
import React, { useState } from 'react';

interface DateSliderProps {
    min: Date,
    max: Date,
    layerDate: Date,
    onChange: (value: Date) => void
}

export const DateSlider = (props: DateSliderProps) => {
    const { min, max, layerDate, onChange } = props;
    const [ currentDate, setCurrentDate ] = useState(layerDate || min);
    const { Handle } = Slider;

    const handleChange = (value: any) => {
        const nextCurrentDate = new Date(min.getTime());
        nextCurrentDate.setDate(value);

        onChange(nextCurrentDate);

        setCurrentDate(nextCurrentDate);
    };

    const handle = ({ value, dragging, index, ...restProps }: any) => {
        return (
            <SliderTooltip
                prefixCls="rc-slider-tooltip"
                overlay={`${value}`}
                visible={dragging}
                placement="top"
                key={index}
            >
                <Handle value={value} {...restProps} />
            </SliderTooltip>
        );
    };

    const steps = Math.round((max.getDate() - min.getDate()) / (1000 * 60 * 60 * 24));
    const val = Math.round((currentDate.getDate() - min.getDate()) / (1000 * 60 * 60 * 24));

    return (
        <Slider
            dots
            max={steps}
            value={val}
            onChange={handleChange}
            handle={handle}

        />
    );
};
