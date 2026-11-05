export default function PrivacyNoticePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Draft · For legal review before production use
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Privacy Notice</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: 21 September 2026</p>

        <div className="mt-6 space-y-8 text-sm leading-7 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Information the Service may process</h2>
            <p className="mt-2">UNSPOKEN MINDS SAFEspace may process your anonymous display name, a password stored as a hash, profile preferences, support-chat messages, mood and goal entries, resource activity, and requests submitted through professional-directory forms. Such forms may include contact details, professional credentials, availability, and notes. When you create an account, we record the Terms and Conditions version you accepted and the acceptance timestamp.</p>
            <p className="mt-2">Some preferences and session identifiers may be stored in your browser. Application data may be stored through Supabase and other providers needed to operate the Service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How information is used</h2>
            <p className="mt-2">Information may be used to provide anonymous account access, community and resource features, progress tools, professional-directory requests, service safety, administration, and to keep a record of agreement to the applicable Terms version.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Your privacy and safety</h2>
            <p className="mt-2">Anonymous display names do not guarantee anonymity or confidentiality. Other users may copy or disclose group-chat content. Do not post sensitive personal, medical, financial, or identifying information in public or group chat spaces. The Service is not an emergency service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Your choices and rights</h2>
            <p className="mt-2">Data protection rights and how to exercise them depend on applicable law. Before production launch, the operator must publish an official privacy contact, data-controller details, hosting and international-transfer details, retention and deletion periods, access/correction/deletion procedures, cookie details, processing legal bases, and an age/guardian policy where applicable.</p>
          </section>
        </div>

        <p className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          This notice is a draft and is not a substitute for legal advice or a complete privacy notice. The operator should complete and review it for each intended jurisdiction before public launch.
        </p>
      </article>
    </div>
  );
}
