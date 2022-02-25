import Slider, { SliderTooltip } from 'rc-slider';
import React, { useState } from 'react';
import { Slice } from 'types';
import 'react-pro-sidebar/dist/css/styles.css';
import styles from './styles.scss';

interface DateSliderProps {
    onChange: (value: number) => void,
    slices: Slice[]
}

export const DateSlider = (props: DateSliderProps) => {
    const { slices, onChange } = props;
    const { Handle } = Slider;

    const [ layerDate, setLayerDate ] = useState(0);

    const handleChange = (value: number) => {
        onChange(value);
        setLayerDate(value);
    };

    const handle = ({ value, dragging, index, ...restProps }: any) => {
        let currentDate = '';
        slices.forEach((slice, i) => {
            if (value === i) currentDate = slice.date;
        });
        return (
            <SliderTooltip
                prefixCls="rc-slider-tooltip"
                overlay={`${currentDate}`}
                visible={dragging}
                placement="top"
                key={index}
            >
                <Handle value={value} {...restProps} />
            </SliderTooltip>
        );
    };

    return (
        <Slider
            dots
            min={0}
            max={slices.length - 1}
            value={layerDate}
            onChange={handleChange}
            handle={handle}
            className={styles.slider}
        />
    );
};
