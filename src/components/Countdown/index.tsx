import Countdown from 'react-countdown';
import {useCallback, useEffect, useRef} from 'react';
import {countdownStore} from '@/store';

export type CountdownRefType = Countdown | null;


export default function CountDown() {
    const countdownRef = useRef<CountdownRefType>(null); // not use
    const {initializeCountdown, startCountdown, resetCountdown, stopCountdown} = countdownStore();
    const countSec = countdownStore(state => state.countSec);


    // region [Events]

    const onStart = useCallback(() => {
        console.log('onStart');
    }, []);

    const onStop = useCallback(() => {
        console.log('onStop');
    }, []);

    const onReset = useCallback(() => {
        console.log('onReset');
    }, []);

    const onComplete = useCallback(() => {
        console.log('onComplete');
    }, []);

    // endregion


    // initialize
    useEffect(() => {
        if (!countdownRef?.current) {
            throw Error('Invalid countdownRef');
        }
        initializeCountdown(countdownRef!.current as Countdown);
    }, []);

    const renderer = useCallback(({seconds}: { seconds: number }) => {
        return (<>{seconds}</>);
    }, []);

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap:'24px'}}>
            <div>
                <button onClick={() => {startCountdown(); }}>Start</button>
                <button onClick={ resetCountdown}>Reset</button>
                <button onClick={stopCountdown}>Stop</button>
            </div>
            <h1>
                <Countdown
                    ref={countdownRef}
                    date={Date.now() + countSec * 1000}
                    autoStart={false}
                    renderer={renderer}
                    onStart={onStart}
                    onPause={onStop}
                    onStop={onReset}
                    onComplete={onComplete}
                >
                    <>Done!</>
                </Countdown>
            </h1>
        </div>
    );
}
