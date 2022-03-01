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

    const marks = Object.fromEntries(slices.map((slice, i) => {
        return [ i, <span className={styles.sliderSpan}>{slice.date.slice(0, 4)}</span> ];
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
                overlay={`${currentDate.slice(0, 10)}`}
                visible={dragging}
                placement="top"
                key={index}
            >
                <Handle value={value} {...restProps} />
            </SliderTooltip>
        );
    };

    const renderRadioButtons = () => {
        return slices.map((_, i) => (
            <input
                type="radio"
                name="radioDate"
                value={i}
                key={i.toString()}
                className={styles.radioInput}
            />
        ));
    };

    return (
        <div className={styles.wrapperComponent}>
            <div className={styles.buttonGroup}>
                {renderRadioButtons()}
            </div>
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
        </div>
    );
};
