
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'manga-images';
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('Missing R2 environment variables.');
    process.exit(1);
}

const r2Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function main() {
    console.log(`Inspecting 'covers/' in bucket: ${R2_BUCKET_NAME}`);

    try {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: 'covers/',
            MaxKeys: 50,
        });

        const response: any = await r2Client.send(command);

        if (!response.Contents || response.Contents.length === 0) {
            console.log('No covers found.');
            return;
        }

        console.log('Found covers:');
        response.Contents.forEach((item: any) => {
            console.log(`- ${item.Key} (Size: ${item.Size})`);
        });

    } catch (error) {
        console.error('Error inspecting bucket:', error);
    }
}

main();
