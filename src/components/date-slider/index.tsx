import Slider, { SliderTooltip } from 'rc-slider';
import React, { useRef, useState } from 'react';
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
    const sliderRef = useRef<any>();

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

    const selectClosestMark = (e: React.MouseEvent<HTMLElement>) => {
        const clickedArea = e.clientX;
        const markElementsArray = e.currentTarget.children[0]
            .getElementsByClassName('rc-slider-mark')[0]
            .getElementsByClassName('rc-slider-mark-text');

        let middlesArray = [];

        for (const elemMark of markElementsArray) {
            const { x, width } = elemMark.getBoundingClientRect();
            const middle = x + (width / 2);
            middlesArray.push(middle);
        }

        let closestElement = 0;
        if (clickedArea < middlesArray[0]) {
            handleChange(0);
        } else if (clickedArea < middlesArray[middlesArray.length]) {
            handleChange(middlesArray.length - 1);
        } else {
            let diff = Math.abs(middlesArray[0] - clickedArea);
            middlesArray.forEach((value, i) => {
                if (Math.abs(value - clickedArea) < diff) {
                    diff = Math.abs(value - clickedArea);
                    closestElement = i;
                }
            });
            handleChange(closestElement);
        }
    };

    return (
        <div
            className={styles.wrapperSlider}
            onClick={(e: React.MouseEvent<HTMLElement>) => selectClosestMark(e)}
            onKeyPress={() => {}}
            role="button"
            tabIndex={0}
        >
            <Slider
                dots
                min={0}
                max={slices.length - 1}
                value={layerDate}
                onChange={handleChange}
                handle={handle}
                className={styles.slider}
                marks={marks}
                ref={sliderRef}
            />
        </div>
    );
};
