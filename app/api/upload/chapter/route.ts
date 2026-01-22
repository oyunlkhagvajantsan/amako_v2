import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Check authentication
                const session = await getServerSession(authOptions);
                if (!session || session.user.role !== "ADMIN") {
                    throw new Error('Unauthorized');
                }

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                    addRandomSuffix: true,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This is called on the server when the upload is finished.
                console.log('blob upload completed', blob, tokenPayload);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
