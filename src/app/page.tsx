import DefaultLayout from '@/layout/DefaultLayout';
import {Skeleton} from '@/components';
import dynamic from 'next/dynamic';

const NoSSRVideoSlider = dynamic(() =>
        import('@/components/VideoSlider/VideoSlider.tsx'),
    {ssr: false, loading: Skeleton},
);


export default function Home() {
    return (
        <DefaultLayout>
            <NoSSRVideoSlider/>
        </DefaultLayout>
    );
}
