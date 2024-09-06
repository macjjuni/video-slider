'use client';

import {useKeenSlider} from 'keen-slider/react';
import {useCallback, useEffect, useMemo, useState, memo} from 'react';
import videoDataList from '@/data.ts';
import VideoPlayer, {SourceType} from '@/components/VideoPlayer';
import NextPreviewer from '@/components/NextPreviewer';
import countdownStore from '@/store/countdownStore.ts';
import 'keen-slider/keen-slider.min.css';


function VideoSlider() {

    // region [Hooks]

    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
    const [sliderRef, instanceRef] = useKeenSlider(
        {
            slideChanged(e) {
                setCurrentSlideIndex(e.track?.details?.rel || 0);
            },
        },
    );
    const {startCountdown, resetCountdown, stopCountdown, setIsShow} = countdownStore(state => state);
    const [videoList] = useState<SourceType[]>([...videoDataList]);
    const [isBrowserFocus, setIsBrowserFocus] = useState(true);
    const countRef = countdownStore(state => state.countRef);


    // endregion


    // region [Privates]

    const clearNextPreviewer = useCallback(() => {
        setIsShow(false);
        setTimeout(() => {
            resetCountdown();
        }, 500)
    }, [setIsShow, resetCountdown]);

    const onPrev = useCallback(() => {
        instanceRef.current?.prev();
        clearNextPreviewer();
    }, [clearNextPreviewer]);

    const onNext = useCallback(() => {
        instanceRef.current?.next();
        clearNextPreviewer();
    }, [clearNextPreviewer]);

    const onPlayEndAfterAction = useCallback(() => {
        startCountdown();
    }, [startCountdown]);

    const onCountdownEndAfterAction = useCallback(() => {
        onNext();
    }, [onNext]);

    const initializeBrowserFocus = useCallback(() => {
        setIsBrowserFocus(document.hasFocus());
    }, []);

    // endregion


    // region [Events]

    const onFocusBrowser = useCallback(() => {
        setIsBrowserFocus(true);
    }, []);

    const onBlurBrowser = useCallback(() => {
        setIsBrowserFocus(false);
    }, []);

    // endregion


    const sanitizedVideoList = useMemo(() => (
        videoList.map((videoData, idx) => (
            <div key={videoData.src} className="keen-slider__slide">
                <VideoPlayer idx={idx} isSelected={idx === currentSlideIndex} isBrowserFocus={isBrowserFocus}
                             source={videoData} onPlayEndAfterAction={onPlayEndAfterAction}/>
            </div>
        ))
    ), [videoList, currentSlideIndex, isBrowserFocus]);

    // Initialize Browser Event
    useEffect(() => {
        initializeBrowserFocus();
        window.addEventListener('blur', onBlurBrowser);
        window.addEventListener('focus', onFocusBrowser);

        return () => {
            window.removeEventListener('blur', onBlurBrowser);
            window.removeEventListener('focus', onFocusBrowser);
        };
    }, []);

    // Browser focus or blur event check
    useEffect(() => {
        const isStarted = countRef?.isStarted();
        const isPaused = countRef?.isPaused();

        if (!isBrowserFocus && isStarted) {
            stopCountdown();
            return;
        }
        if (isBrowserFocus && isPaused) {
            const restSec = countRef?.state.timeDelta.seconds || 5;
            startCountdown(restSec);
        }
    }, [isBrowserFocus]);


    return (
        <div>
            <div className="slider__wrapper">
                <div ref={sliderRef} className="keen-slider">
                    {sanitizedVideoList}
                </div>
                <NextPreviewer nextAction={onCountdownEndAfterAction}/>
            </div>
            <div className={'slider-control__wrapper'}>
                <button onClick={onPrev}>⬅️</button>
                <button onClick={onNext}>➡️</button>
            </div>

        </div>
    );
}

export default memo(VideoSlider);
