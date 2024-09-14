import {create} from 'zustand';
import {createRef, MutableRefObject} from "react";
import {KeenSliderHooks, KeenSliderInstance} from "keen-slider/react";
import {countdownStore} from "@/store/index.ts";

interface CountStoreType {
    currentSlideIndex: number;
    setCurrentSlideIndex: (index: number) => void;
    sliderRef: MutableRefObject<KeenSliderInstance<KeenSliderHooks> | null>;
    initializeSliderRef: (ref: MutableRefObject<KeenSliderInstance<KeenSliderHooks> | null>) => void;
    onPrev: () => void;
    onNext: () => void;
}

function clearNextPreviewer() {
    countdownStore.getState().resetCountdown();
}

const sliderStore = create<CountStoreType>((set) => ({
    currentSlideIndex: 0,
    setCurrentSlideIndex: (currentSlideIndex) => set((state) => ({
        ...state, currentSlideIndex
    })),
    sliderRef: createRef(),
    initializeSliderRef: (sliderRef) => set((state) => ({
        ...state, sliderRef
    })),
    onPrev: () => set((state) => {
        clearNextPreviewer();
        state.sliderRef.current?.prev();
        return {...state}
    }),
    onNext: () => set((state) => {
        clearNextPreviewer();
        state.sliderRef.current?.next();
        return {...state}
    }),
}));

export default sliderStore;
