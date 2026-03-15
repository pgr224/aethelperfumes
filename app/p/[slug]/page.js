import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function StaticPageView({ params }) {
    const { slug } = await params;

    const page = await prisma.staticPage.findUnique({
        where: { slug }
    });

    if (!page) {
        notFound();
    }

    return (
        <div className="static-page">
            <main style={{ paddingTop: '160px', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <h1 className="section-title text-center" style={{ marginBottom: '4rem' }}>{page.title}</h1>
                    <div 
                        className="content-view" 
                        dangerouslySetInnerHTML={{ __html: page.content }}
                        style={{
                            lineHeight: '1.8',
                            color: 'var(--color-gray-light)',
                            fontSize: '1.1rem'
                        }}
                    />
                </div>
            </main>
        </div>
    );
}
