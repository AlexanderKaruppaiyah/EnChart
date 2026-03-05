import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

const BUCKET = 'flowcharts';

async function ensureBucket(supabase: ReturnType<typeof getSupabaseServer>) {
    const { data } = await supabase.storage.getBucket(BUCKET);
    if (!data) {
        const { error } = await supabase.storage.createBucket(BUCKET, {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024, // 10 MB
        });
        if (error && !error.message?.includes('already exists')) {
            throw new Error(`Cannot create storage bucket: ${error.message}`);
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const { teamId, questionId, imageData } = await req.json();
        const supabaseServer = getSupabaseServer();

        // 1. Validate input
        if (!imageData) throw new Error('No image data provided');
        const base64Data = imageData.split(',')[1];
        if (!base64Data) throw new Error('Invalid image format');

        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `${teamId}/question_${questionId}.png`;

        // 2. Ensure storage bucket exists
        await ensureBucket(supabaseServer);

        // 3. Upload to Supabase Storage
        const { error: uploadError } = await supabaseServer
            .storage
            .from(BUCKET)
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseServer
            .storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        // 5. Record in submissions table (server-side bypasses RLS)
        const { error: dbError } = await supabaseServer
            .from('submissions')
            .insert([{
                team_id: teamId,
                question_id: questionId,
                storage_path: publicUrl,
            }]);

        if (dbError) {
            console.error('DB insert failed:', dbError);
            throw new Error(`Submission saved to storage but DB record failed: ${dbError.message}`);
        }

        return NextResponse.json({ success: true, path: publicUrl });

    } catch (error) {
        console.error('Submission API Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Submission failed.',
        }, { status: 400 });
    }
}
