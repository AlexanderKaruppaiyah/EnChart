import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { teamId } = await req.json();
        if (!teamId) throw new Error('Team ID is required');

        const supabase = getSupabaseServer();
        const now = new Date().toISOString();

        // Only set started_at if not already set (first-start wins)
        const { data: existing } = await supabase
            .from('teams')
            .select('started_at')
            .eq('id', teamId)
            .single();

        if (existing?.started_at) {
            // Already started — return the existing timestamp so the timer is consistent
            return NextResponse.json({ success: true, started_at: existing.started_at });
        }

        const { error } = await supabase
            .from('teams')
            .update({ started_at: now })
            .eq('id', teamId);

        if (error) throw error;

        return NextResponse.json({ success: true, started_at: now });
    } catch (error) {
        console.error('Start API Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to start.'
        }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId');
        if (!teamId) throw new Error('Team ID is required');

        const supabase = getSupabaseServer();
        const { data, error } = await supabase
            .from('teams')
            .select('started_at')
            .eq('id', teamId)
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, started_at: data?.started_at || null });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed.',
            started_at: null
        }, { status: 400 });
    }
}
