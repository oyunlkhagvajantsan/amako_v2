"use server";

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "manga-images";
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("Missing R2 environment variables.");
}

const r2Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
});

export async function listR2Covers() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: "covers/",
            MaxKeys: 100, // Reasonable limit for UI
        });

        const response: any = await r2Client.send(command);
        const covers: string[] = [];

        if (response.Contents) {
            response.Contents.forEach((item: any) => {
                if (item.Key && !item.Key.endsWith("/")) { // Exclude folder itself if listed
                    // Construct full URL
                    const url = R2_PUBLIC_URL
                        ? `${R2_PUBLIC_URL}/${item.Key}`
                        : item.Key; // Or handle usage on frontend if no public URL
                    covers.push(url);
                }
            });
        }

        return { success: true, covers };
    } catch (error) {
        console.error("Error listing R2 covers:", error);
        return { success: false, error: "Failed to fetch covers" };
    }
}
