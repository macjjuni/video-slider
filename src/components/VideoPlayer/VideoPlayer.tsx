'use client';

import {memo, useCallback, useEffect, useRef, useState} from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import './VideoPlayer.scss';
import CountdownText, {CountdownTextRefs} from "@/components/VideoPlayer/components/CountdownText.tsx";
import {videoStore} from "@/store";

type PlayerOption = typeof videojs.options;

export interface SourceType {
    id: string;
    src: string;
    type: string;
    isView: boolean;
}

interface VideoPlayerType {
    idx: number;
    isSelected: boolean;
    source: SourceType;
    onPlayEndAfterAction: () => void;
    isBrowserFocus: boolean;
    updateAction: (idx: string) => void;
}


const mathFloor = (num: number) => {
    return Math.floor(num);
};

function VideoPlayer({idx, isSelected, source, onPlayEndAfterAction, isBrowserFocus, updateAction}: VideoPlayerType) {

    // region [Hooks]

    const [isLoaded, setIsLoaded] = useState(false);
    const isEnd = useRef<boolean>(false); // 종료 여부
    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const totalTime = useRef<number>(0);
    const countdownTextRef = useRef<CountdownTextRefs>(null);
    const initializePlayerRef = videoStore(state => state.initializePlayerRef);

    // endregion


    // region [CountdownText]

    const setCountdownText = useCallback((time: number | null) => {
        countdownTextRef.current?.setPlaytime(time);
    }, []);

    // endregion


    // region [Events]

    const onVideoLoadedEvent = useCallback(() => {
        const player = playerRef.current as Player;
        totalTime.current = mathFloor(player?.duration() || 0);
        setIsLoaded(true);
    }, []);

    const onVideoPlayEvent = useCallback(() => {
        onSetIsEnd(false);
        console.log(`%con Play action. --> ${idx}`, 'background-color: red; color: white; padding: 4px;');
    }, [idx]);

    const onVideoStopEvent = useCallback(() => {
        console.log(`%con Stop action. --> ${idx}`, 'background-color: blue; color: white; padding: 4px;');
    }, [idx]);

    const onVideoEndEvent = useCallback(() => {
        onSetIsEnd(true);
        updateAction(source.id);
        setTimeout(() => {
            onPlayEndAfterAction?.();
        }, 1000);
    }, [updateAction, source, onPlayEndAfterAction]);

    const onVideoTimeUpdate = useCallback(() => {

        const player = playerRef.current as Player;

        const currentTime = mathFloor(player?.currentTime() || 0);
        const diffTime = totalTime.current - currentTime;
        setCountdownText(diffTime);
    }, [setCountdownText]);

    // endregion


    // region [Privates]

    const initializeVideoPlayerEvent = useCallback((player: Player) => {

        const eventTarget = [
            {name: 'loadedmetadata', action: onVideoLoadedEvent},
            {name: 'play', action: onVideoPlayEvent},
            {name: 'pause', action: onVideoStopEvent},
            {name: 'timeupdate', action: onVideoTimeUpdate},
            {name: 'ended', action: onVideoEndEvent},
        ];
        eventTarget.forEach(item => { player.on(item.name, item.action);});
    }, [onVideoLoadedEvent, onVideoPlayEvent, onVideoStopEvent, onVideoTimeUpdate, onVideoEndEvent]);

    const initializeVideoPlayer = useCallback(() => {
        if (!videoRef?.current) {
            throw Error('Invalid videoRef');
        }

        const videoElement = document.createElement('video-js');
        videoRef.current!.appendChild(videoElement);

        playerRef.current = videojs(videoElement, {
            ...getOptions(),
            sources: [{...source}],
        }) as Player;

        if (!playerRef.current) {
            throw Error('Invalid playerRef.current');
        }
        initializeVideoPlayerEvent(playerRef.current as Player);
    }, [source, initializeVideoPlayerEvent]);

    const clearVideoPlayer = useCallback(() => {
        const player = playerRef.current as Player;

        if (player && !player.isDisposed()) {
            player.dispose();
            playerRef.current = null;
        }
    }, []);

    const clearState = useCallback(() => {
        setCountdownText(null);
    }, [setCountdownText]);

    const onPlayVideoPlayer = useCallback(() => {
        if (!document.hasFocus()) { return; }

        const player = playerRef.current as Player;
        player?.muted(true);
        player?.play();
    }, []);

    const onStopVideoPlayer = useCallback(() => {
        const player = playerRef.current as Player;
        player?.pause();
    }, []);

    const onSetIsEnd = useCallback((bool: boolean) => {
        isEnd.current = bool;
    }, []);


    // endregion


    // region [Life Cycles]

    useEffect(() => {
        const isReady = playerRef?.current?.isReady_;

        if (isSelected) {
            if (playerRef?.current) {
                initializePlayerRef(playerRef.current)
            }
            onSetIsEnd(false);
        }

        // 플레이 상태이고 이미 플레이어가 준비된 상태인 경우
        if (isSelected && isLoaded && isReady) {
            onPlayVideoPlayer();
            return;
        }
        // 플레이 상태이고 플레이어가 없는 경우
        if (isSelected && !isLoaded && !isReady) {
            initializeVideoPlayer();
            // console.log('isSelected = true / isLoaded = false / isReady = false', idx);
            return;
        }
        // 멈춤 상태이고 플레이어가 없는 경우
        if (!isSelected && isReady) {
            onStopVideoPlayer();
            // console.log('isSelected = false / isReady = true', idx);
            return;
        }
    }, [isSelected, isLoaded]);

    useEffect(() => {
        // 플레이 상태인데 브라우저 blur 상태인 경우
        if (!isBrowserFocus && isSelected) {
            onStopVideoPlayer();
            return;
        }
        // 플레이 상태이고 브라우저가 focus 상태인 경우
        if (isBrowserFocus && isSelected && !isEnd.current) {
            onPlayVideoPlayer();
            return;
        }
    }, [isBrowserFocus]);

    useEffect(() => {
        // Clean up
        return () => {
            clearVideoPlayer();
            clearState();
        };
    }, []);

    // endregion

    return (
        <div ref={videoRef} className={'video-player__wrapper'}>
            <CountdownText ref={countdownTextRef} />
            <div className={'video-player__isView'}>{!source.isView ? '미시청' : '시청완료' }</div>
        </div>
    );
}

export default memo(VideoPlayer);


function getOptions(): PlayerOption {
    return {
        controls: false,
        errorDisplay: true,
        aspectRatio: '16:9',
        controlBar: {
            remainingTimeDisplay: false,
            progressControl: {seekBar: true},
            playbackRateMenuButton: false,
            chaptersButton: false,
            fullscreenToggle: false,
            volumePanel: false,
            captionsButton: false,
            subtitlesButton: false,
            pictureInPictureToggle: false,
            playToggle: true,
        },
        fill: true,
        preload: 'auto',
        autoplay: false,
        responsive: true,
        playsinline: true,
        loadingSpinner: true,
        fluid: true,
        enableSmoothSeeking: true,
        loop: false,
        restoreEl: true,
    } as PlayerOption;  // 강제 타입 캐스팅
}
