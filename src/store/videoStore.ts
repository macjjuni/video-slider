import {create} from 'zustand';
import Player from "video.js/dist/types/player";
import {countdownStore} from "@/store/index.ts";

interface VideoStoreType {
    playerRef: Player | null;
    initializePlayerRef: (initializePlayerRef: Player | null) => void
    onPlay: () => void;
    onStop: () => void;
}


const videoStore = create<VideoStoreType>((set) => ({
    playerRef: null,
    initializePlayerRef: (playerRef) => set((state) => ({...state, playerRef})),
    onPlay: () => set((state) => {
        const { countRef, resetCountdown } = countdownStore.getState();

        if (countRef?.isStarted()) {
            // 영상 끝나고 5초 NextPreviewer 상태인 경우 카운트다운 리셋
            resetCountdown();
        }
        state.playerRef?.play();
        return { ...state }
    }),
    onStop: () => set((state) => {
        state.playerRef?.pause();

        return { ...state }
    }),
}));

export default videoStore;
