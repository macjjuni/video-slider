'use client';

import Countdown from 'react-countdown';
import {memo, useCallback, useRef} from 'react';
import {countdownStore} from '../../store';
import './NextPreviewer.scss';


interface NextPreviewerProps {
    nextAction: () => void;
}


function NextPreviewer({nextAction}: NextPreviewerProps) {

    // region [Hooks]

    const countContainerRef = useRef<HTMLDivElement | null>(null);
    const initializeCountdown = countdownStore(state => state.initializeCountdown);
    const countSec = countdownStore(state => state.countSec);

    // endregion


    // region [Privates]

    const onContainerShow = useCallback(() => {
        (countContainerRef.current as HTMLDivElement).style.opacity = '1';
    }, []);

    const onContainerHide = useCallback(() => {
        (countContainerRef.current as HTMLDivElement).style.opacity = '0';
    }, []);

    // endregion


    // region [Events]

    const onStart = useCallback(() => {
        onContainerShow();
    }, [onContainerShow]);

    const onStop = useCallback(() => {
        console.log('onStop');
    }, []);

    const onReset = useCallback(() => {
        onContainerHide();
        console.log('onReset');
    }, [onContainerHide]);

    const onComplete = useCallback(() => {
        setTimeout(() => {
            onContainerHide();
            nextAction?.();
        }, 800)
    }, [onContainerHide, nextAction]);

    // endregion


    const renderer = useCallback(({seconds}: { seconds: number }) => {
        return (<>{seconds}</>);
    }, []);

    return (
        <div ref={countContainerRef} className={`next-previewer__wrapper`}>
            <div className={'next-previewer__wrapper__countdown'}>
                <Countdown
                    ref={(api) => {
                        initializeCountdown(api as Countdown);
                    }}
                    date={Date.now() + countSec * 1000}
                    autoStart={false}
                    renderer={renderer}
                    onStart={onStart}
                    onPause={onStop}
                    onStop={onReset}
                    onComplete={onComplete}
                />
            </div>
            <div className="next-previewer__content">
                다음 광고로 전환됩니다.
            </div>
        </div>
    );
}

export default memo(NextPreviewer);
