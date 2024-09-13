import {NextResponse} from 'next/server';
import videoDataList from '@/data.ts';
import {SourceType} from '@/components/VideoPlayer/VideoPlayer.tsx';


let videoDatas =  videoDataList.map(item => item);
export async function GET(): Promise<NextResponse<{ data: SourceType[] }>> {

    try {

        return NextResponse.json({data: videoDatas});
    } catch (err) {
        console.error(err);

        return NextResponse.json({data: []});
    }
}


export async function POST(request: Request): Promise<NextResponse<{ data: SourceType[] }>> {

    const { data } = await request.json();

    if (data) {
        videoDatas = videoDatas.map(item => {
            if (item.id === data) {
                item.isView = true;
            }
            return item;
        })
    }
    return NextResponse.json({data: videoDatas});
}
