import Countdown from 'react-countdown';
import {memo, useCallback, useEffect, useRef} from 'react';
import {countdownStore} from '../../store';
import './index.css';

export type CountdownRefType = Countdown | null;

interface NextPreviewerProps {
    nextAction: () => void;
}


function Index({nextAction}: NextPreviewerProps) {

    // region [Hooks]

    const countContainerRef = useRef<HTMLDivElement | null>(null);
    const countdownRef = useRef<CountdownRefType>(null);
    const initializeCountdown = countdownStore(state => state.initializeCountdown);
    const resetCountdown = countdownStore(state => state.resetCountdown);


    const countSec = countdownStore(state => state.countSec);
    const isShow = countdownStore(state => state.isShow);
    const setIsShow = countdownStore(state => state.setIsShow);

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
        setIsShow(true);
    }, []);

    const onStop = useCallback(() => {
        console.log('onStop');
    }, []);

    const onReset = useCallback(() => {
        console.log('onReset');
    }, []);

    const onComplete = useCallback(() => {

        setTimeout(() => {
            setIsShow(false);
        }, 1000)

        setTimeout(() => {
            nextAction?.();
        }, 1500);

    }, [resetCountdown]);

    // endregion


    // region [Life Cycles]

    useEffect(() => {
        // initialize
        if (!countdownRef?.current) {
            throw Error('Invalid countdownRef');
        }
        initializeCountdown(countdownRef!.current as Countdown);
    }, []);

    useEffect(() => {
        if (isShow) {
            onContainerShow();
        } else {
            onContainerHide();
        }
    }, [isShow]);

    // endregion


    const renderer = useCallback(({seconds}: { seconds: number }) => {
        return (<>{seconds}</>);
    }, []);

    return (
        <div ref={countContainerRef} className={`next-previewer__wrapper`}>
            <div className={'next-previewer__wrapper__countdown'}>
                <Countdown
                    ref={countdownRef}
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

export default memo(Index);
