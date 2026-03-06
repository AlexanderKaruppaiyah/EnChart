import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { teamName, member1, member2 } = await req.json();

        if (!teamName?.trim()) throw new Error('Team name is required.');
        if (!member1?.name?.trim() || !member2?.name?.trim()) throw new Error('Both member names are required.');

        const supabase = getSupabaseServer();

        /* ── 1. Create or find the team ── */
        let teamId: string | number;
        let resolvedName: string;

        // Try inserting with 'name' column
        const { data: newTeam, error: insertErr } = await supabase
            .from('teams')
            .insert([{ name: teamName.trim() }])
            .select('id, team_name')
            .single();

        if (insertErr) {
            // Could be a duplicate name OR a wrong column name — try fallback column 'team_name'
            const { data: altTeam, error: altInsertErr } = await supabase
                .from('teams')
                .insert([{ team_name: teamName.trim() }])
                .select('id, team_name')
                .single();

            if (altInsertErr) {
                // Both column names failed — check if it's a duplicate team name
                // and look up the existing team to allow re-entry
                const { data: existing, error: lookupErr } = await supabase
                    .from('teams')
                    .select('id, name, team_name')
                    .or(`name.eq.${teamName.trim()},team_name.eq.${teamName.trim()}`)
                    .maybeSingle();

                if (lookupErr || !existing) {
                    throw new Error(`Could not register team: ${insertErr.message}`);
                }
                teamId = existing.id;
                resolvedName = existing.name || existing.team_name || teamName;
            } else {
                teamId = altTeam.id;
                resolvedName = altTeam.team_name || teamName;
            }
        } else {
            teamId = newTeam.id;
            resolvedName = newTeam.team_name || teamName;
        }

        /* ── 2. Upsert members (safe against duplicate pkey / retry) ── */
        // Delete existing members for this team first (handles re-registration cleanly)
        await supabase
            .from('members')
            .delete()
            .eq('team_id', teamId);

        const members = [
            { name: member1.name.trim(), email: member1.email?.trim() || '', contact: member1.contact?.trim() || '', team_id: teamId },
            { name: member2.name.trim(), email: member2.email?.trim() || '', contact: member2.contact?.trim() || '', team_id: teamId },
        ];

        const { error: membersError } = await supabase
            .from('members')
            .insert(members);

        if (membersError) {
            // If still fails (e.g. pkey sequence issue), try one at a time for better error info
            throw new Error(`Failed to add members: ${membersError.message}. Try running: SELECT setval(pg_get_serial_sequence('members', 'id'), MAX(id)) FROM members; in Supabase SQL editor.`);
        }

        return NextResponse.json({
            success: true,
            team: {
                id: teamId,
                name: resolvedName,
                members: [member1, member2],
            },
        });

    } catch (error) {
        console.error('Registration API Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to register team.',
        }, { status: 400 });
    }
}
