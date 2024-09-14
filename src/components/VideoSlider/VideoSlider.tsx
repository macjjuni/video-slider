'use client';

import {KeenSliderHooks, KeenSliderInstance, useKeenSlider} from 'keen-slider/react';
import {useCallback, useEffect, useMemo, useState, memo, MutableRefObject} from 'react';
import {VideoPlayer, Controller} from '@/components/index.ts';
import type {SourceType} from '@/components/VideoPlayer/VideoPlayer.tsx';
import NextPreviewer from '@/components/NextPreviewer/NextPreviewer.tsx';
import countdownStore from '@/store/countdownStore.ts';
import { sliderStore } from "@/store";
import './VideoSlider.scss';
import 'keen-slider/keen-slider.min.css';


function VideoSlider({list}: { list: SourceType[] }) {

    // region [Hooks]

    const {currentSlideIndex, setCurrentSlideIndex} = sliderStore(state => state);
    const [sliderRef, instanceRef] = useKeenSlider(
        {
            slideChanged(e) {
                setCurrentSlideIndex(e.track?.details?.rel || 0);
            },
        },
    );
    const initializeSliderRef = sliderStore(state => state.initializeSliderRef);
    const onNext = sliderStore(state => state.onNext);
    const {startCountdown, stopCountdown} = countdownStore(state => state);
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
    }, [updateVideoViewHistory]);

    // endregion


    // region [Events]

    const onFocusBrowser = useCallback(() => {
        setIsBrowserFocus(true);
    }, []);

    const onBlurBrowser = useCallback(() => {
        setIsBrowserFocus(false);
    }, []);

    // endregion


    // region [Templates]

    const sanitizedVideoList = useMemo(() => (
        videoList.map((videoData, idx) => (
            <div key={videoData.src} className="keen-slider__slide">
                <VideoPlayer idx={idx} isSelected={idx === currentSlideIndex} isBrowserFocus={isBrowserFocus}
                             source={videoData} onPlayEndAfterAction={onPlayEndAfterAction}
                             updateAction={onUpdateVideoView}/>
            </div>
        ))
    ), [videoList, currentSlideIndex, isBrowserFocus, onPlayEndAfterAction, onUpdateVideoView]);

    // endregion


    // region [Life Cycles]

    useEffect(() => {
        initializeSliderRef(instanceRef as MutableRefObject<KeenSliderInstance<KeenSliderHooks>>);
    }, [initializeSliderRef, instanceRef]);

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


    // endregion

    return (
        <div>
            <div className="slider__wrapper">
                <div ref={sliderRef} className="keen-slider">
                    {sanitizedVideoList}
                </div>
                <NextPreviewer nextAction={onCountdownEndAfterAction}/>
            </div>
            <Controller />
        </div>
    );
}

export default memo(VideoSlider);
