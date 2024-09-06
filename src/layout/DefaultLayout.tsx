import './DefaultLayout.css';

export default function DefaultLayout({ children}: {children: React.ReactNode}) {
    return (
        <div className={'default__layout'}>
            {children}
        </div>
    );
};
