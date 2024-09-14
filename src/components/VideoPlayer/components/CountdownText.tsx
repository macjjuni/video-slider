import React, {Dispatch, forwardRef, memo, SetStateAction, useImperativeHandle, useState} from 'react';

export interface CountdownTextRefs {
    getCurrentPlaytime: () => number | null;
    setPlaytime: Dispatch<SetStateAction<number | null>>
}

const CountdownText = forwardRef<CountdownTextRefs>((_, ref) => {
    const [playtime, setPlaytime] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({
        getCurrentPlaytime: () => playtime,
        setPlaytime
    }));

    if (playtime === null) {
        return null;
    }

    return (
        <div className="video-player__wrapper__time">
            <span>{playtime}</span>
        </div>
    );
});
CountdownText.displayName = 'CountdownText';
export default memo(CountdownText);
