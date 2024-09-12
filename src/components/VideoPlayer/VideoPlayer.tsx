'use client';

import {memo, useCallback, useEffect, useRef, useState} from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import './VideoPlayer.scss';

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
    updateAction: (idx: number) => void;
}


const mathFloor = (num: number) => {
    return Math.floor(num);
};

function VideoPlayer({idx, isSelected, source, onPlayEndAfterAction, isBrowserFocus, updateAction}: VideoPlayerType) {

    // region [Hooks]

    const [isLoaded, setIsLoaded] = useState(false);
    const isEnd = useRef<boolean>(false);
    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const totalTime = useRef<number>(0);
    const [playTime, setPlayTime] = useState<number | null>(null);

    // endregion


    // region [Events]

    const onVideoLoadedEvent = useCallback(() => {
        const player = playerRef.current as Player;
        totalTime.current = mathFloor(player?.duration() || 0);
        setIsLoaded(true);
    }, [isSelected]);

    const onVideoPlayEvent = useCallback(() => {
        console.log(`%con Play aciton. --> ${idx}`, 'background-color: red; color: white; padding: 4px;');
    }, [idx]);

    const onVideoStopEvent = useCallback(() => {
        console.log(`%con Stop aciton. --> ${idx}`, 'background-color: blue; color: white; padding: 4px;');
    }, []);

    const onVideoEndEvent = useCallback(() => {
        onSetIsEnd(true);
        updateAction(idx);
        setTimeout(() => {
            onPlayEndAfterAction?.();
        }, 1000);
    }, []);


    const onVideoTimeUpdate = useCallback(() => {

        const player = playerRef.current as Player;

        const currentTime = mathFloor(player?.currentTime() || 0);
        const diffTime = totalTime.current - currentTime;

        // 렌더링 최적화(값이 같으면 업데이트 안함)
        if (playTime === diffTime) { return; }

        setPlayTime(diffTime);
    }, [playTime]);

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
        setPlayTime(null);
    }, []);

    const onStartVideoPlayer = useCallback(() => {
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

        if (isSelected) { onSetIsEnd(false); }

        // 플레이 상태이고 이미 플레이어가 준비된 상태인 경우
        if (isSelected && isLoaded && isReady) {
            onStartVideoPlayer();
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
            onStartVideoPlayer();
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
            {
                playTime !== null && (
                    <div className={'video-player__wrapper__time'}>
                        <span>{playTime}</span>
                    </div>
                )
            }
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
