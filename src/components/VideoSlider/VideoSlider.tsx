'use client';

import {useKeenSlider} from 'keen-slider/react';
import {useCallback, useEffect, useMemo, useState, memo} from 'react';
import {VideoPlayer} from '@/components/index.ts';
import type {SourceType} from '@/components/VideoPlayer/VideoPlayer.tsx';
import NextPreviewer from '@/components/NextPreviewer/NextPreviewer.tsx';
import countdownStore from '@/store/countdownStore.ts';
import './VideoSlider.scss';
import 'keen-slider/keen-slider.min.css';


function VideoSlider({list}: { list: SourceType[] }) {

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
    const [videoList, setVideoList] = useState<SourceType[]>([...list]);
    const [isBrowserFocus, setIsBrowserFocus] = useState(true);
    const countRef = countdownStore(state => state.countRef);

    // endregion


    // region [Transactions]

    const updateVideoViewHistory = useCallback(async(id: string) => {
        try {
            const {data: videoList} = await fetch('http://localhost:3000/api/video-list', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ data: id }),
            }).then(res => res.json());
            setVideoList([...videoList]);
        } catch (err) {
            console.error(err);
        }
    }, []);

    // endregion


    // region [Privates]

    const clearNextPreviewer = useCallback(() => {
        setIsShow(false);
        setTimeout(() => {
            resetCountdown();
        }, 1000);
    }, [setIsShow, resetCountdown]);

    const onPrev = useCallback(() => {
        instanceRef.current?.prev();
        clearNextPreviewer();
    }, [clearNextPreviewer]);

    const onNext = useCallback(() => {
        instanceRef.current?.next();
        clearNextPreviewer();
    }, [clearNextPreviewer]);

    // const onStop = useCallback(() => {
    // }, [])

    const onPlayEndAfterAction = useCallback(() => {
        startCountdown();
    }, [startCountdown]);

    const onCountdownEndAfterAction = useCallback(() => {
        onNext();
    }, [onNext]);

    const initializeBrowserFocus = useCallback(() => {
        setIsBrowserFocus(document.hasFocus());
    }, []);

    // 시청완료 처리
    const onUpdateVideoView = useCallback((idx: string) => {
        updateVideoViewHistory(idx).then();
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
                             source={videoData} onPlayEndAfterAction={onPlayEndAfterAction}
                             updateAction={onUpdateVideoView}/>
            </div>
        ))
    ), [videoList, currentSlideIndex, isBrowserFocus, onUpdateVideoView]);

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
                {/* <button onClick={onStop}>⏹️</button> */}
                <button onClick={onNext}>➡️</button>
            </div>
        </div>
    );
}

export default memo(VideoSlider);
