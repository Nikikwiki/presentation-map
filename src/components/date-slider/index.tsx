import Slider from '@mui/material/Slider';
import React, { useState } from 'react';
import { Slice } from 'types';
import moment from 'moment';
import styles from './styles.scss';

interface DateSliderProps {
    onChange: (value: number) => void,
    slices: Slice[]
}

export const DateSlider = (props: DateSliderProps) => {
    const { slices, onChange } = props;

    const [ layerDate, setLayerDate ] = useState(0);

    const marks = slices.map((slice, i) => {
        return { label: moment(slice.date).format('YYYY'),
            value: i };
    });

    const handleChange = (value: number) => {
        onChange(value);
        setLayerDate(value);
    };

    const handleOnChange = (e: Event, value: any) => {
        onChange(value);
        setLayerDate(value);
    };

    const lableChange = (value: number) => {
        const slice = slices.find((_, i) => i === value);
        return slice ? `${moment(slice.date).format('DD.MM.YYYY')}` : '';
    };

    const selectClosestMark = (e: React.MouseEvent<HTMLElement>) => {
        const clickedArea = e.clientX;

        const markElementsArray = e.currentTarget.children[0]
            .getElementsByClassName('MuiSlider-markLabel');

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
                aria-label='slices'
                marks={marks}
                value={layerDate}
                min={0}
                max={slices.length - 1}
                onChange={(e, value) => handleOnChange(e, value)}
                valueLabelFormat={lableChange}
                valueLabelDisplay="auto"
            />
        </div>
    );
};
