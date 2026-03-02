import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const specialization = typeof body.specialization === 'string' ? body.specialization.trim() : '';
    const licenseNumber = typeof body.licenseNumber === 'string' ? body.licenseNumber.trim() : '';
    const yearsExperience = typeof body.yearsExperience === 'string' ? body.yearsExperience.trim() : '';
    const availabilityNotes = typeof body.availabilityNotes === 'string' ? body.availabilityNotes.trim() : '';
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    const offersFreeServices = Boolean(body.offersFreeServices);

    if (!fullName || !email || !title || !specialization || !licenseNumber) {
      return NextResponse.json({ error: 'Missing required professional details.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('professional_applications').insert({
      full_name: fullName,
      email,
      phone,
      title,
      specialization,
      license_number: licenseNumber,
      years_experience: yearsExperience,
      offers_free_services: offersFreeServices,
      availability_notes: availabilityNotes,
      bio,
      status: 'pending'
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to submit professional application.' }, { status: 500 });
  }
}
