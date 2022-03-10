import Slider, { SliderTooltip } from 'rc-slider';
import React, { useState } from 'react';
import { Slice } from 'types';
import 'react-pro-sidebar/dist/css/styles.css';
import moment from 'moment';
import styles from './styles.scss';

interface DateSliderProps {
    onChange: (value: number) => void,
    slices: Slice[]
}

export const DateSlider = (props: DateSliderProps) => {
    const { slices, onChange } = props;
    const { Handle } = Slider;

    const [ layerDate, setLayerDate ] = useState(0);

    const marks = Object.fromEntries(slices.map((slice, i) => {
        return [ i, <div className={styles.sliderSpan}>{moment(slice.date).format('YYYY')}</div> ];
    }));

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
                overlay={moment(currentDate).format('DD.MM.YYYY')}
                visible={dragging}
                placement="top"
                key={index}
            >
                <Handle value={value} {...restProps} />
            </SliderTooltip>
        );
    };

    return (
        <div className={styles.wrapperSlider}>
            <Slider
                dots
                min={0}
                max={slices.length - 1}
                value={layerDate}
                onChange={handleChange}
                handle={handle}
                className={styles.slider}
                marks={marks}
            />
        </div>
    );
};
