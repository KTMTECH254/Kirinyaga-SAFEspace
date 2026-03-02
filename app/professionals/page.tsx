'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Manrope, Merriweather } from 'next/font/google';
import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Star,
  Stethoscope,
  UserPlus,
  X
} from 'lucide-react';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' });

type ProfessionalType = 'Psychologist' | 'Psychiatrist' | 'Therapist' | 'Counselor';
type Availability = 'Online' | 'Offline';
type SessionMode = 'Chat' | 'Video Call' | 'In-Person';

type Professional = {
  id: number;
  name: string;
  title: string;
  type: ProfessionalType;
  tags: string[];
  bio: string;
  fullBio: string;
  qualifications: string;
  experience: string;
  rating?: number;
  availability: Availability;
  image: string;
  services: string[];
  whatsappNumber: string;
  email: string;
  chatRoom: string;
};

type FreeSupportProfile = {
  name: string;
  specialization: string;
  chatRoom: string;
};

const PROFESSIONALS: Professional[] = [
  {
    id: 1,
    name: 'Dr. Naomi Wanjiru',
    title: 'Consultant Psychiatrist',
    type: 'Psychiatrist',
    tags: ['Anxiety', 'Trauma', 'Medication Support'],
    bio: 'Evidence-based psychiatric care with a compassionate focus on emotional safety and long-term recovery.',
    fullBio:
      'Dr. Naomi is a board-certified psychiatrist with extensive experience supporting adolescents and adults navigating anxiety disorders, mood instability, trauma symptoms, and stress-related burnout. She combines medication management with collaborative psychoeducation for stable long-term outcomes.',
    qualifications: 'MBChB, MMed Psychiatry, Kenya Medical Practitioners and Dentists Council Licensed',
    experience: '11 years',
    rating: 4.9,
    availability: 'Online',
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=800&q=80',
    services: ['Free Consultation', 'Paid Session', 'Emergency Support'],
    whatsappNumber: '254700123101',
    email: 'naomi.wanjiru@kirinyaga-safespace.org',
    chatRoom: '/chat/anxiety'
  },
  {
    id: 2,
    name: 'Dr. Miriam Kamau',
    title: 'Clinical Psychologist',
    type: 'Psychologist',
    tags: ['Depression', 'CBT', 'Youth Mental Health'],
    bio: 'Focused on practical therapy plans that help clients regain emotional control and daily function.',
    fullBio:
      'Dr. Miriam is a licensed clinical psychologist specializing in cognitive behavioral therapy and adolescent wellness care. Her work centers on clear treatment planning, measurable progress, and supportive environments that protect dignity and privacy.',
    qualifications: 'PhD Clinical Psychology, HCPC Equivalent Registration, Licensed Clinical Practitioner',
    experience: '8 years',
    rating: 4.8,
    availability: 'Online',
    image: 'https://images.unsplash.com/photo-1594824388853-d0c3d1e8fd44?auto=format&fit=crop&w=800&q=80',
    services: ['Free Consultation', 'Paid Session'],
    whatsappNumber: '254700123102',
    email: 'miriam.kamau@kirinyaga-safespace.org',
    chatRoom: '/chat/depression'
  },
  {
    id: 3,
    name: 'Samuel Njoroge',
    title: 'Licensed Trauma Therapist',
    type: 'Therapist',
    tags: ['PTSD', 'Grief', 'EMDR'],
    bio: 'Trauma-informed, structured support for clients recovering from loss, conflict, and chronic stress.',
    fullBio:
      'Samuel is a licensed therapist trained in trauma recovery frameworks including EMDR-informed interventions and grief integration support. He works with clients in both short-term stabilization and long-form recovery pathways.',
    qualifications: 'MSc Counseling Psychology, Licensed Trauma Therapist, Certified EMDR Practitioner',
    experience: '10 years',
    rating: 4.7,
    availability: 'Offline',
    image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=800&q=80',
    services: ['Paid Session', 'Emergency Support'],
    whatsappNumber: '254700123103',
    email: 'samuel.njoroge@kirinyaga-safespace.org',
    chatRoom: '/chat/recovery'
  },
  {
    id: 4,
    name: 'Evelyn Atieno',
    title: 'Family and Youth Counselor',
    type: 'Counselor',
    tags: ['Family Support', 'School Stress', 'Conflict Resolution'],
    bio: 'Warm and structured counseling for teens, parents, and families navigating difficult transitions.',
    fullBio:
      'Evelyn is a licensed counselor with deep experience in family systems, academic pressure, and communication restoration. Her sessions emphasize safe dialogue, practical coping tools, and emotionally responsible support for both youth and caregivers.',
    qualifications: 'BA Counseling, Licensed Family Counselor, Child Safeguarding Trained',
    experience: '6 years',
    rating: 4.6,
    availability: 'Online',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=800&q=80',
    services: ['Free Consultation', 'Paid Session'],
    whatsappNumber: '254700123104',
    email: 'evelyn.atieno@kirinyaga-safespace.org',
    chatRoom: '/chat/students'
  }
];

const FREE_SUPPORT: FreeSupportProfile[] = [
  { name: 'Dr. Miriam Kamau', specialization: 'Depression and CBT', chatRoom: '/chat/depression' },
  { name: 'Evelyn Atieno', specialization: 'Family Counseling', chatRoom: '/chat/students' },
  { name: 'Dr. Naomi Wanjiru', specialization: 'Anxiety Stabilization', chatRoom: '/chat/anxiety' },
  { name: 'Samuel Njoroge', specialization: 'Trauma Recovery', chatRoom: '/chat/recovery' }
];

const FILTERS: Array<ProfessionalType | 'All'> = ['All', 'Psychologist', 'Psychiatrist', 'Therapist', 'Counselor'];

export default function ProfessionalsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProfessionalType | 'All'>('All');
  const [selectedProfile, setSelectedProfile] = useState<Professional | null>(null);
  const [requestTarget, setRequestTarget] = useState<Professional | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  const [sessionRequest, setSessionRequest] = useState({
    requesterName: '',
    requesterContact: '',
    preferredDate: '',
    preferredTime: '',
    sessionMode: 'Chat' as SessionMode,
    notes: ''
  });

  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    title: '',
    specialization: '',
    licenseNumber: '',
    yearsExperience: '',
    offersFreeServices: false,
    availabilityNotes: '',
    bio: ''
  });

  const filteredProfessionals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return PROFESSIONALS.filter((professional) => {
      const matchesFilter = selectedFilter === 'All' || professional.type === selectedFilter;
      const matchesSearch =
        !normalizedSearch ||
        professional.name.toLowerCase().includes(normalizedSearch) ||
        professional.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch)) ||
        professional.title.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [search, selectedFilter]);

  const openWhatsApp = (professional: Professional) => {
    const message = encodeURIComponent(`Hello ${professional.name}, I would like to request a mental health support session.`);
    window.open(`https://wa.me/${professional.whatsappNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const openRequestModal = (professional: Professional) => {
    const storedUser = localStorage.getItem('anonymousUser');
    let requesterName = '';

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as { name?: string };
        requesterName = parsed.name || '';
      } catch {
        requesterName = '';
      }
    }

    setRequestTarget(professional);
    setSessionRequest((prev) => ({
      ...prev,
      requesterName: requesterName || prev.requesterName
    }));
  };

  const submitSessionRequest = async () => {
    if (!requestTarget) return;

    if (!sessionRequest.requesterName.trim() || !sessionRequest.requesterContact.trim() || !sessionRequest.preferredDate) {
      setToast('Please fill in name, contact, and preferred date.');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const storedUser = localStorage.getItem('anonymousUser');
      let requesterProfileId: string | null = null;

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as { profileId?: string };
          requesterProfileId = parsed.profileId || null;
        } catch {
          requesterProfileId = null;
        }
      }

      const response = await fetch('/api/professionals/session-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName: sessionRequest.requesterName,
          requesterProfileId,
          requesterContact: sessionRequest.requesterContact,
          professionalName: requestTarget.name,
          professionalTitle: requestTarget.title,
          preferredDate: sessionRequest.preferredDate,
          preferredTime: sessionRequest.preferredTime,
          sessionMode: sessionRequest.sessionMode,
          notes: sessionRequest.notes
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Could not submit request right now.');
      }

      setToast(`Session request sent to ${requestTarget.name}.`);
      setRequestTarget(null);
      setSessionRequest({
        requesterName: '',
        requesterContact: '',
        preferredDate: '',
        preferredTime: '',
        sessionMode: 'Chat',
        notes: ''
      });
    } catch (error) {
      const fallback = {
        ...sessionRequest,
        professionalName: requestTarget.name,
        createdAt: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('session_requests_backup') || '[]') as Array<Record<string, unknown>>;
      existing.push(fallback);
      localStorage.setItem('session_requests_backup', JSON.stringify(existing));

      setToast(
        error instanceof Error
          ? `${error.message} Saved locally as backup.`
          : 'Submission failed. Saved locally as backup.'
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const submitApplication = async () => {
    if (
      !applicationForm.fullName.trim() ||
      !applicationForm.email.trim() ||
      !applicationForm.title.trim() ||
      !applicationForm.specialization.trim() ||
      !applicationForm.licenseNumber.trim()
    ) {
      setToast('Please complete all required professional details.');
      return;
    }

    setIsSubmittingApplication(true);

    try {
      const response = await fetch('/api/professionals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationForm)
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Could not submit application right now.');
      }

      setToast('Application submitted successfully. Our verification team will contact you.');
      setJoinModalOpen(false);
      setApplicationForm({
        fullName: '',
        email: '',
        phone: '',
        title: '',
        specialization: '',
        licenseNumber: '',
        yearsExperience: '',
        offersFreeServices: false,
        availabilityNotes: '',
        bio: ''
      });
    } catch (error) {
      const backupApplications = JSON.parse(localStorage.getItem('professional_applications_backup') || '[]') as Array<Record<string, unknown>>;
      backupApplications.push({ ...applicationForm, createdAt: new Date().toISOString() });
      localStorage.setItem('professional_applications_backup', JSON.stringify(backupApplications));

      setToast(
        error instanceof Error
          ? `${error.message} Saved locally as backup.`
          : 'Submission failed. Saved locally as backup.'
      );
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  return (
    <div className={`${manrope.className} min-h-screen bg-[#eef4f6] text-[#0f2730]`}>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-[#cfe2e8] bg-gradient-to-br from-[#f7fbfc] via-[#f2f8fa] to-[#eaf3f6] px-6 py-10 shadow-[0_16px_45px_rgba(15,39,48,0.08)] sm:px-10">
          <div className="pointer-events-none absolute -right-14 -top-12 h-44 w-44 rounded-full bg-[#8ec5d8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-[#80bfa9]/20 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f0f4] px-3 py-1 text-xs font-semibold text-[#14607a]">
                <BadgeCheck size={14} />
                All professionals are verified
              </div>
              <h1 className={`${merriweather.className} text-3xl font-bold sm:text-4xl`}>Licensed Professionals</h1>
              <p className="max-w-2xl text-sm text-[#35515b] sm:text-base">
                Connect with verified mental health experts.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4a6974]" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or specialization..."
                  className="h-12 w-full rounded-xl border border-[#c5dbe2] bg-white/90 pl-11 pr-4 text-sm outline-none transition focus:border-[#4e92a7] focus:ring-2 focus:ring-[#8fc0cf]/40"
                />
              </div>

              <div className="relative w-full lg:w-72">
                <Filter size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4a6974]" />
                <select
                  value={selectedFilter}
                  onChange={(event) => setSelectedFilter(event.target.value as ProfessionalType | 'All')}
                  className="h-12 w-full appearance-none rounded-xl border border-[#c5dbe2] bg-white/90 pl-10 pr-4 text-sm outline-none transition focus:border-[#4e92a7] focus:ring-2 focus:ring-[#8fc0cf]/40"
                >
                  {FILTERS.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="h-12 rounded-xl bg-[#0f6077] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,96,119,0.24)] transition hover:bg-[#0b4f61]"
              >
                Join as Professional
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10" id="verification-standards">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className={`${merriweather.className} text-2xl font-bold`}>Verified Care Team</h2>
            <div className="flex items-center gap-2 rounded-full border border-[#f0c980] bg-[#fff7ea] px-4 py-2 text-xs text-[#8a5c16]">
              <AlertTriangle size={14} />
              Emergency notice: For immediate danger, contact local emergency services.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProfessionals.map((professional) => (
              <article
                key={professional.id}
                className="rounded-2xl border border-[#d5e3e8] bg-white p-5 shadow-[0_10px_30px_rgba(20,55,69,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(20,55,69,0.12)]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#c6dce3]">
                      <Image src={professional.image} alt={professional.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#153845]">{professional.name}</h3>
                        <BadgeCheck size={15} className="text-[#159060]" />
                      </div>
                      <p className="text-xs text-[#4b6670]">{professional.title}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      professional.availability === 'Online'
                        ? 'bg-[#e6f6ee] text-[#15754c]'
                        : 'bg-[#eef2f4] text-[#5c6d74]'
                    }`}
                  >
                    {professional.availability}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {professional.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#edf5f8] px-2.5 py-1 text-[11px] font-medium text-[#2f5b6a]">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mb-4 line-clamp-2 text-sm leading-6 text-[#3b5964]">{professional.bio}</p>

                {professional.rating && (
                  <div className="mb-4 flex items-center gap-1 text-sm text-[#516a73]">
                    <Star size={14} className="fill-[#f3b34f] text-[#f3b34f]" />
                    {professional.rating.toFixed(1)} rating
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => router.push(professional.chatRoom)}
                    className="rounded-lg border border-[#bfd6dd] bg-[#f3fbfd] px-3 py-2 text-xs font-semibold text-[#18495a] transition hover:bg-[#e8f4f8]"
                  >
                    Chat Now
                  </button>
                  <button
                    onClick={() => openWhatsApp(professional)}
                    className="rounded-lg border border-[#bfd6dd] bg-[#f3fbfd] px-3 py-2 text-xs font-semibold text-[#18495a] transition hover:bg-[#e8f4f8]"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => openRequestModal(professional)}
                    className="rounded-lg border border-[#bfd6dd] bg-[#f3fbfd] px-3 py-2 text-xs font-semibold text-[#18495a] transition hover:bg-[#e8f4f8]"
                  >
                    Request Session
                  </button>
                  <button
                    onClick={() => setSelectedProfile(professional)}
                    className="rounded-lg bg-[#0f6077] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0b4f61]"
                  >
                    View Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 size={18} className="text-[#1d7288]" />
            <h2 className={`${merriweather.className} text-2xl font-bold`}>Professionals Offering Free Support Today</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {FREE_SUPPORT.map((profile) => (
              <article
                key={profile.name}
                className="min-w-[260px] flex-1 rounded-2xl border border-[#d5e3e8] bg-white p-4 shadow-[0_8px_24px_rgba(20,55,69,0.08)]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#123643]">{profile.name}</p>
                  <span className="rounded-full bg-[#e9f9ef] px-2.5 py-1 text-[11px] font-semibold text-[#17663f]">
                    Free Session Available
                  </span>
                </div>
                <p className="mb-4 text-sm text-[#45606a]">{profile.specialization}</p>
                <button
                  onClick={() => router.push(profile.chatRoom)}
                  className="w-full rounded-lg border border-[#b8d7c8] bg-[#edf9f1] px-3 py-2 text-sm font-semibold text-[#1b6841] transition hover:bg-[#dff2e6]"
                >
                  Start Free Chat
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-[#cde0e6] bg-gradient-to-r from-[#f0f8fb] to-[#ecf6f4] px-6 py-10 shadow-[0_14px_34px_rgba(20,55,69,0.08)] sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className={`${merriweather.className} text-3xl font-bold`}>Are You a Licensed Professional?</h2>
              <p className="mt-3 text-sm leading-6 text-[#45636e] sm:text-base">
                Join our trusted mental health support network, offer secure care, provide free service slots, and
                advertise your availability to people who need timely support.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setJoinModalOpen(true)}
                className="rounded-xl bg-[#0f6077] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4f61]"
              >
                Apply Now
              </button>
              <button
                onClick={() => document.getElementById('verification-standards')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-xl border border-[#bad2da] bg-white px-5 py-3 text-sm font-semibold text-[#174a5b] transition hover:bg-[#f1f8fa]"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#0f2730] px-5 py-2 text-sm text-white shadow-lg">
          {toast}
          <button onClick={() => setToast('')} className="ml-3 text-white/70 hover:text-white" aria-label="Close message">
            <X size={14} className="inline" />
          </button>
        </div>
      )}

      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07141a]/65 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c7dce3] bg-[#f8fcfd] p-6 shadow-[0_24px_56px_rgba(7,20,26,0.4)] sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#b8d2dc]">
                  <Image src={selectedProfile.image} alt={selectedProfile.name} fill sizes="80px" className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`${merriweather.className} text-xl font-bold`}>{selectedProfile.name}</h3>
                    <BadgeCheck size={16} className="text-[#159060]" />
                  </div>
                  <p className="text-sm text-[#4f6871]">{selectedProfile.title}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-full border border-[#c7dce3] bg-white p-2 text-[#35535e] transition hover:bg-[#edf5f7]"
                aria-label="Close profile modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-5 text-sm leading-6 text-[#385762]">{selectedProfile.fullBio}</p>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#d5e3e8] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5c7680]">Qualifications</p>
                <p className="mt-1 text-sm text-[#2a4b56]">{selectedProfile.qualifications}</p>
              </div>
              <div className="rounded-xl border border-[#d5e3e8] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5c7680]">Experience</p>
                <p className="mt-1 text-sm text-[#2a4b56]">{selectedProfile.experience}</p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-[#d5e3e8] bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5c7680]">Services Offered</p>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.services.map((service) => (
                  <span key={service} className="rounded-full bg-[#eef6f9] px-3 py-1 text-xs font-semibold text-[#2e5b6b]">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => router.push(selectedProfile.chatRoom)}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#bfd6dd] bg-white px-3 py-2 text-sm font-semibold text-[#18495a] transition hover:bg-[#edf5f8]"
              >
                <MessageCircle size={14} /> Chat
              </button>
              <button
                onClick={() => openWhatsApp(selectedProfile)}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#bfd6dd] bg-white px-3 py-2 text-sm font-semibold text-[#18495a] transition hover:bg-[#edf5f8]"
              >
                <Stethoscope size={14} /> WhatsApp
              </button>
              <button
                onClick={() => (window.location.href = `mailto:${selectedProfile.email}?subject=${encodeURIComponent('Mental Health Support Inquiry')}`)}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#bfd6dd] bg-white px-3 py-2 text-sm font-semibold text-[#18495a] transition hover:bg-[#edf5f8]"
              >
                <Mail size={14} /> Email
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedProfile(null);
                openRequestModal(selectedProfile);
              }}
              className="w-full rounded-xl bg-[#0f6077] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4f61]"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}

      {requestTarget && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-[#07141a]/65 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#c7dce3] bg-[#f8fcfd] p-6 shadow-[0_24px_56px_rgba(7,20,26,0.4)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className={`${merriweather.className} text-xl font-bold`}>Request Session</h3>
                <p className="text-sm text-[#4f6871]">with {requestTarget.name}</p>
              </div>
              <button
                onClick={() => setRequestTarget(null)}
                className="rounded-full border border-[#c7dce3] bg-white p-2 text-[#35535e] transition hover:bg-[#edf5f7]"
                aria-label="Close request modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={sessionRequest.requesterName}
                onChange={(e) => setSessionRequest((prev) => ({ ...prev, requesterName: e.target.value }))}
                placeholder="Your name"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={sessionRequest.requesterContact}
                onChange={(e) => setSessionRequest((prev) => ({ ...prev, requesterContact: e.target.value }))}
                placeholder="Email or phone"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                type="date"
                value={sessionRequest.preferredDate}
                onChange={(e) => setSessionRequest((prev) => ({ ...prev, preferredDate: e.target.value }))}
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                type="time"
                value={sessionRequest.preferredTime}
                onChange={(e) => setSessionRequest((prev) => ({ ...prev, preferredTime: e.target.value }))}
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <select
                value={sessionRequest.sessionMode}
                onChange={(e) => setSessionRequest((prev) => ({ ...prev, sessionMode: e.target.value as SessionMode }))}
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7] sm:col-span-2"
              >
                <option>Chat</option>
                <option>Video Call</option>
                <option>In-Person</option>
              </select>
              <textarea
                value={sessionRequest.notes}
                onChange={(e) => setSessionRequest((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any details you want the professional to know"
                className="min-h-24 rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7] sm:col-span-2"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={submitSessionRequest}
                disabled={isSubmittingRequest}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f6077] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4f61] disabled:opacity-70"
              >
                {isSubmittingRequest && <Loader2 size={14} className="animate-spin" />} Submit Request
              </button>
              <button
                onClick={() => setRequestTarget(null)}
                className="rounded-xl border border-[#bad2da] bg-white px-5 py-3 text-sm font-semibold text-[#174a5b] transition hover:bg-[#f1f8fa]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {joinModalOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-[#07141a]/65 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c7dce3] bg-[#f8fcfd] p-6 shadow-[0_24px_56px_rgba(7,20,26,0.4)] sm:p-8">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className={`${merriweather.className} text-xl font-bold`}>Professional Application</h3>
                <p className="text-sm text-[#4f6871]">Submit your details for verification and listing.</p>
              </div>
              <button
                onClick={() => setJoinModalOpen(false)}
                className="rounded-full border border-[#c7dce3] bg-white p-2 text-[#35535e] transition hover:bg-[#edf5f7]"
                aria-label="Close application modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={applicationForm.fullName}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full name"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                type="email"
                value={applicationForm.email}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={applicationForm.phone}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={applicationForm.title}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Professional title"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={applicationForm.specialization}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, specialization: e.target.value }))}
                placeholder="Specialization"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={applicationForm.licenseNumber}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="License number"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={applicationForm.yearsExperience}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, yearsExperience: e.target.value }))}
                placeholder="Years of experience"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <input
                value={applicationForm.availabilityNotes}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, availabilityNotes: e.target.value }))}
                placeholder="Availability notes"
                className="rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7]"
              />
              <textarea
                value={applicationForm.bio}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Short professional bio"
                className="min-h-24 rounded-lg border border-[#c6dbe2] bg-white px-3 py-2 text-sm outline-none focus:border-[#4e92a7] sm:col-span-2"
              />
              <label className="inline-flex items-center gap-2 text-sm text-[#2f5461] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={applicationForm.offersFreeServices}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, offersFreeServices: e.target.checked }))}
                />
                I can provide free support sessions for vulnerable users.
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={submitApplication}
                disabled={isSubmittingApplication}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f6077] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4f61] disabled:opacity-70"
              >
                {isSubmittingApplication ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Submit Application
              </button>
              <button
                onClick={() => setJoinModalOpen(false)}
                className="rounded-xl border border-[#bad2da] bg-white px-5 py-3 text-sm font-semibold text-[#174a5b] transition hover:bg-[#f1f8fa]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
