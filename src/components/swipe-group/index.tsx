import React, { ChangeEvent, useLayoutEffect, useRef } from 'react';
import { Slice } from 'types';

import styles from './styles.scss';

interface SwipeGroupProps {
    slices: Slice[];
    onChange: (value: number) => void,
}

export const SwipeGroup = (props: SwipeGroupProps) => {
    const { slices, onChange } = props;

    const firstInput = useRef<any>();

    useLayoutEffect(() => {
        if (firstInput !== null) {
            firstInput.current.checked = true;
        }
    }, []);

    const handleRadioButtonChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(parseInt(e.target.value));
    };
    const renderRadioButtons = () => {
        return slices.map((_, i) => (
            <input
                type="radio"
                name="radioDate"
                value={i}
                key={i.toString()}
                className={styles.radioInput}
                onChange={(e) => handleRadioButtonChange(e)}
                ref={i === 0 ? firstInput : null}
            />
        ));
    };

    return (
        <div className={styles.buttonGroup}>
            {renderRadioButtons()}
        </div>
    );
};
