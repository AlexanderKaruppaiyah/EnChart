import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId');

        if (!teamId) throw new Error('Team ID is required');

        const supabase = getSupabaseServer();
        const { data, error } = await supabase
            .from('submissions')
            .select('question_id')
            .eq('team_id', teamId);

        if (error) throw error;

        // Return a list of submitted question IDs
        const submittedIds = data.map((s: { question_id: number }) => s.question_id);
        return NextResponse.json({ submissions: submittedIds });

    } catch (error) {
        console.error('Fetch submissions error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
    }
}
