import DefaultLayout from '@/layout/DefaultLayout';
import {Skeleton} from '@/components';
import dynamic from 'next/dynamic';
import {SourceType} from '@/components/VideoPlayer/VideoPlayer.tsx';

const NoSSRVideoSlider = dynamic(() =>
        import('@/components/VideoSlider/VideoSlider.tsx'),
    {ssr: false, loading: Skeleton},
);

async function getVideoList(): Promise<SourceType[]> {
    const res = await fetch('http://localhost:3000/api/video-list', { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to fetch video list');
    }
    const { data } = await res.json();
    return data;
}



export default async function Home() {

    const list = await getVideoList();

    return (
        <DefaultLayout>
            <NoSSRVideoSlider list={list}/>
        </DefaultLayout>
    );
}
