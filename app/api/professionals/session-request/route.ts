import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const requesterName = typeof body.requesterName === 'string' ? body.requesterName.trim() : '';
    const requesterProfileId = typeof body.requesterProfileId === 'string' ? body.requesterProfileId : null;
    const requesterContact = typeof body.requesterContact === 'string' ? body.requesterContact.trim() : '';
    const professionalName = typeof body.professionalName === 'string' ? body.professionalName.trim() : '';
    const professionalTitle = typeof body.professionalTitle === 'string' ? body.professionalTitle.trim() : '';
    const preferredDate = typeof body.preferredDate === 'string' ? body.preferredDate.trim() : '';
    const preferredTime = typeof body.preferredTime === 'string' ? body.preferredTime.trim() : '';
    const sessionMode = typeof body.sessionMode === 'string' ? body.sessionMode.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

    if (!requesterName || !requesterContact || !professionalName || !preferredDate) {
      return NextResponse.json({ error: 'Missing required session request details.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('professional_session_requests').insert({
      requester_name: requesterName,
      requester_profile_id: requesterProfileId,
      requester_contact: requesterContact,
      professional_name: professionalName,
      professional_title: professionalTitle,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      session_mode: sessionMode,
      notes,
      status: 'pending'
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to submit session request.' }, { status: 500 });
  }
}
