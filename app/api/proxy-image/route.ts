import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy Route
 * Bypasses CORS restrictions for image processing (like cropping)
 * Fetches an external image and returns it as a local response
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type');
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
