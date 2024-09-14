import {create} from 'zustand';
import Countdown from 'react-countdown';

interface CountStoreType {
    countRef: Countdown | null;
    initializeCountdown: (ref: Countdown) => void;
    countSec: number;
    setCountSet: (countSec: number) => void;
    startCountdown: (sec?: number) => void;
    stopCountdown: () => void;
    resetCountdown: () => void;
}

const defaultCountSec = 5;

const countdownStore = create<CountStoreType>((set) => ({
    countRef: null,
    initializeCountdown: (countRef: Countdown) => set((state) => ({...state, countRef})),
    countSec: defaultCountSec,
    setCountSet: (countSec: number) => set(() => ({countSec})),
    startCountdown: (sec?: number) => set((state) => {
        if (document.hasFocus()) { // 브라우저 포커스 상태일 때만 실행
            if (typeof sec === 'number') {
                state.setCountSet(sec);
            }
            state?.countRef?.start();
        }
        return state;
    }),
    stopCountdown: () => set((state) => {
        state.countRef?.pause();
        return state;
    }),
    resetCountdown: () => set((state) => {
        state.countRef?.stop();
        return state ;
    }),
}));

export default countdownStore;
