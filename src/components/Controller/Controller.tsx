import React, {memo} from 'react';
import {sliderStore, videoStore} from "@/store";

function Controller() {

    const onNext = sliderStore(state=> state.onNext);
    const onPrev = sliderStore(state=> state.onPrev);
    const onPlay = videoStore(state => state.onPlay);
    const onStop = videoStore(state => state.onStop);

    return (
        <div className={'slider-control__wrapper'}>
            <button onClick={onPrev}>⬅️</button>
            <button onClick={onStop}>⏹</button>
            <button onClick={onPlay}>▶️</button>
            <button onClick={onNext}>➡️</button>
        </div>
    );
};

export default memo(Controller);